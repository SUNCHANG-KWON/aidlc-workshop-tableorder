import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AppError, toAppError } from './lib/errors.js';
import {
  getBearerToken,
  readJsonBody,
  sendJson,
  sendNoContent,
  serveStaticFile
} from './lib/http.js';
import { DataStore } from './services/data-store.js';
import { AuthService } from './services/auth-service.js';
import { MenuService } from './services/menu-service.js';
import { OrderService } from './services/order-service.js';
import { TableSessionService } from './services/table-session-service.js';
import { SseHub } from './services/sse-hub.js';

function parsePathParams(pathname, regex) {
  const match = pathname.match(regex);
  if (!match) {
    return null;
  }
  return match.groups || null;
}

function parseNumber(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

function matchesTableSessionEvent(claims, payload) {
  if (payload?.order) {
    return payload.order.tableNumber === claims.tableNumber;
  }

  return payload?.tableNumber === claims.tableNumber;
}

export function createApp(options = {}) {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const publicDir = options.publicDir ?? path.resolve(dirname, '../public');
  const dataPath = options.dataPath ?? path.resolve(dirname, '../data/db.json');
  const jwtSecret = options.jwtSecret ?? process.env.APP_JWT_SECRET ?? 'local-dev-secret-change-me';

  const dataStore = new DataStore(dataPath);
  const sseHub = new SseHub();
  const authService = new AuthService({ dataStore, jwtSecret });
  const menuService = new MenuService({ dataStore });
  const orderService = new OrderService({ dataStore, sseHub });
  const tableSessionService = new TableSessionService({ dataStore, sseHub });

  async function requireRole(req, role) {
    const token = getBearerToken(req);
    if (!token) {
      throw new AppError(401, 'Authorization header required');
    }
    return authService.verifyToken(token, role);
  }

  async function handleApi(req, res, url) {
    const { pathname, searchParams } = url;

    if (req.method === 'GET' && pathname === '/health') {
      sendJson(res, 200, { ok: true, timestamp: new Date().toISOString() });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/table/login') {
      const body = await readJsonBody(req);
      const result = await authService.loginTable(body);
      sendJson(res, 200, result);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/menu') {
      const storeId = searchParams.get('storeId');
      if (!storeId) {
        throw new AppError(400, 'storeId is required');
      }
      const category = searchParams.get('category');
      const menus = await menuService.listMenus(storeId, category);
      sendJson(res, 200, { items: menus });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/orders') {
      const claims = await requireRole(req, 'table');
      const body = await readJsonBody(req);
      const order = await orderService.createOrder(claims, body);
      sendJson(res, 201, { order });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/orders/current-session') {
      const claims = await requireRole(req, 'table');
      const page = parseNumber(searchParams.get('page'), 1);
      const pageSize = parseNumber(searchParams.get('pageSize'), 20);
      const result = await orderService.listCurrentSessionOrders(claims, page, pageSize);
      sendJson(res, 200, result);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/orders/stream') {
      const claims = await requireRole(req, 'table');
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      });
      res.write('event: ready\ndata: {"ok":true}\n\n');

      const unsubscribe = sseHub.subscribe(
        claims.storeId,
        res,
        (_event, payload) => matchesTableSessionEvent(claims, payload)
      );
      req.on('close', () => {
        unsubscribe();
      });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/admin/login') {
      const body = await readJsonBody(req);
      const result = await authService.loginAdmin(body);
      sendJson(res, 200, result);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/admin/orders/stream') {
      const claims = await requireRole(req, 'admin');
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      });
      res.write('event: ready\ndata: {"ok":true}\n\n');

      const unsubscribe = sseHub.subscribe(claims.storeId, res);
      req.on('close', () => {
        unsubscribe();
      });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/admin/dashboard/orders') {
      const claims = await requireRole(req, 'admin');
      const cards = await orderService.listDashboardOrders(claims.storeId);
      sendJson(res, 200, { tables: cards });
      return;
    }

    const statusMatch = parsePathParams(pathname, /^\/api\/admin\/orders\/(?<orderId>[^/]+)\/status$/);
    if (req.method === 'PATCH' && statusMatch) {
      const claims = await requireRole(req, 'admin');
      const body = await readJsonBody(req);
      const order = await orderService.updateOrderStatus(claims.storeId, statusMatch.orderId, body.status);
      sendJson(res, 200, { order });
      return;
    }

    const deleteOrderMatch = parsePathParams(pathname, /^\/api\/admin\/orders\/(?<orderId>[^/]+)$/);
    if (req.method === 'DELETE' && deleteOrderMatch) {
      const claims = await requireRole(req, 'admin');
      await orderService.deleteOrder(claims.storeId, deleteOrderMatch.orderId);
      sendNoContent(res);
      return;
    }

    const completeMatch = parsePathParams(
      pathname,
      /^\/api\/admin\/tables\/(?<tableNumber>[^/]+)\/session\/complete$/
    );
    if (req.method === 'POST' && completeMatch) {
      const claims = await requireRole(req, 'admin');
      const result = await tableSessionService.completeSession(claims.storeId, completeMatch.tableNumber);
      sendJson(res, 200, result);
      return;
    }

    if (req.method === 'POST' && pathname === '/api/admin/tables/setup') {
      const claims = await requireRole(req, 'admin');
      const body = await readJsonBody(req);
      const configured = await tableSessionService.configureTable(
        claims.storeId,
        body.tableNumber,
        body.tablePassword
      );
      const tableLogin = await authService.loginTable({
        storeId: claims.storeId,
        tableNumber: body.tableNumber,
        tablePassword: body.tablePassword
      });
      sendJson(res, 200, {
        ...configured,
        tableLogin
      });
      return;
    }

    const historyMatch = parsePathParams(pathname, /^\/api\/admin\/tables\/(?<tableNumber>[^/]+)\/history$/);
    if (req.method === 'GET' && historyMatch) {
      const claims = await requireRole(req, 'admin');
      const date = searchParams.get('date');
      const items = await tableSessionService.listHistory(claims.storeId, historyMatch.tableNumber, date);
      sendJson(res, 200, { items });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/admin/menus') {
      const claims = await requireRole(req, 'admin');
      const category = searchParams.get('category');
      const items = await menuService.listMenus(claims.storeId, category);
      sendJson(res, 200, { items });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/admin/menus') {
      const claims = await requireRole(req, 'admin');
      const body = await readJsonBody(req);
      const menu = await menuService.createMenu(claims.storeId, body);
      sendJson(res, 201, { menu });
      return;
    }

    const menuIdMatch = parsePathParams(pathname, /^\/api\/admin\/menus\/(?<menuId>[^/]+)$/);
    if (req.method === 'PUT' && menuIdMatch) {
      const claims = await requireRole(req, 'admin');
      const body = await readJsonBody(req);
      const menu = await menuService.updateMenu(claims.storeId, menuIdMatch.menuId, body);
      sendJson(res, 200, { menu });
      return;
    }

    if (req.method === 'DELETE' && menuIdMatch) {
      const claims = await requireRole(req, 'admin');
      await menuService.deleteMenu(claims.storeId, menuIdMatch.menuId);
      sendNoContent(res);
      return;
    }

    throw new AppError(404, 'Not Found');
  }

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname.startsWith('/api/') || url.pathname === '/health') {
        await handleApi(req, res, url);
        return;
      }
      await serveStaticFile(url.pathname, publicDir, res);
    } catch (error) {
      const appError = toAppError(error);
      sendJson(res, appError.statusCode, {
        error: appError.message,
        details: appError.details
      });
    }
  });

  return {
    server,
    dataStore,
    services: {
      authService,
      menuService,
      orderService,
      tableSessionService
    }
  };
}
