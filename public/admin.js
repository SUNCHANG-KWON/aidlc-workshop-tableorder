const STORAGE_ADMIN_TOKEN = 'tableOrder.admin.token';

const adminBadge = document.querySelector('#adminBadge');
const loginSection = document.querySelector('#loginSection');
const adminApp = document.querySelector('#adminApp');
const loginToast = document.querySelector('#loginToast');
const menuToast = document.querySelector('#menuToast');

const adminStoreId = document.querySelector('#adminStoreId');
const adminUsername = document.querySelector('#adminUsername');
const adminPassword = document.querySelector('#adminPassword');
const adminLoginButton = document.querySelector('#adminLoginButton');
const refreshDashboardButton = document.querySelector('#refreshDashboardButton');
const tableFilterInput = document.querySelector('#tableFilterInput');
const tableCards = document.querySelector('#tableCards');

const setupTableNumberInput = document.querySelector('#setupTableNumberInput');
const setupTablePasswordInput = document.querySelector('#setupTablePasswordInput');
const setupTableButton = document.querySelector('#setupTableButton');
const setupTableToast = document.querySelector('#setupTableToast');

const historyTableInput = document.querySelector('#historyTableInput');
const historyDateInput = document.querySelector('#historyDateInput');
const historyButton = document.querySelector('#historyButton');
const historyCloseButton = document.querySelector('#historyCloseButton');
const historyList = document.querySelector('#historyList');

const menuName = document.querySelector('#menuName');
const menuPrice = document.querySelector('#menuPrice');
const menuCategory = document.querySelector('#menuCategory');
const menuDescription = document.querySelector('#menuDescription');
const menuImageUrl = document.querySelector('#menuImageUrl');
const menuDisplayOrder = document.querySelector('#menuDisplayOrder');
const menuCreateButton = document.querySelector('#menuCreateButton');
const menuList = document.querySelector('#menuList');

let token = localStorage.getItem(STORAGE_ADMIN_TOKEN) || '';
let sseController = null;
let highlightTimer = null;
let autoLogoutTimer = null;

function setToast(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle('error', isError);
}

function formatCurrency(value) {
  return `${value.toLocaleString('ko-KR')}원`;
}

function setBadge(text, ok = false) {
  adminBadge.textContent = text;
  adminBadge.style.background = ok ? '#e3f4eb' : '#f4e4e4';
  adminBadge.style.color = ok ? '#096949' : '#7f1f1f';
}

function decodeTokenExpSeconds(jwtToken) {
  try {
    const parts = jwtToken.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return Number(payload.exp) || null;
  } catch {
    return null;
  }
}

function logoutAdminSession(message = '세션이 만료되었습니다. 다시 로그인하세요.') {
  if (autoLogoutTimer) {
    clearTimeout(autoLogoutTimer);
    autoLogoutTimer = null;
  }
  if (sseController) {
    sseController.abort();
    sseController = null;
  }
  localStorage.removeItem(STORAGE_ADMIN_TOKEN);
  token = '';
  adminApp.classList.add('hidden');
  loginSection.classList.remove('hidden');
  setBadge('로그인 필요', false);
  setToast(loginToast, message, false);
}

function scheduleAutoLogout() {
  if (autoLogoutTimer) {
    clearTimeout(autoLogoutTimer);
    autoLogoutTimer = null;
  }
  const expSeconds = decodeTokenExpSeconds(token);
  if (!expSeconds) {
    return;
  }
  const delayMs = expSeconds * 1000 - Date.now();
  if (delayMs <= 0) {
    logoutAdminSession();
    return;
  }
  autoLogoutTimer = setTimeout(() => {
    logoutAdminSession();
  }, delayMs);
}

async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || '요청 실패');
  }

  if (response.status === 204) {
    return null;
  }
  return response.json();
}

async function loginAdmin() {
  const payload = {
    storeId: adminStoreId.value.trim(),
    username: adminUsername.value.trim(),
    password: adminPassword.value.trim()
  };

  const result = await api('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  token = result.token;
  localStorage.setItem(STORAGE_ADMIN_TOKEN, token);

  loginSection.classList.add('hidden');
  adminApp.classList.remove('hidden');
  setBadge('운영 세션 연결', true);
  setToast(loginToast, '로그인 성공');
  scheduleAutoLogout();

  await refreshDashboard();
  await loadMenus();
  startSse();
}

function showTableOrderDetail(table) {
  const lines = [];
  for (const order of table.latestOrders) {
    const itemLines = order.items.map((item) => `- ${item.menuName} x${item.quantity}`).join('\n');
    lines.push(
      `[${order.orderNumber}] ${new Date(order.createdAt).toLocaleString()} (${order.status})\n${itemLines}\n합계: ${formatCurrency(order.totalAmount)}`
    );
  }
  const body = lines.length > 0 ? lines.join('\n\n') : '주문이 없습니다.';
  window.alert(`Table ${table.tableNumber} 주문 상세\n\n${body}`);
}

function showSingleOrderDetail(order) {
  const itemLines = order.items.map((item) => `- ${item.menuName} x${item.quantity}`).join('\n');
  window.alert(
    `주문 상세\n\n주문번호: ${order.orderNumber}\n시간: ${new Date(order.createdAt).toLocaleString()}\n상태: ${order.status}\n${itemLines}\n합계: ${formatCurrency(order.totalAmount)}`
  );
}

function renderTableCards(tables, highlight = false) {
  tableCards.innerHTML = '';
  if (!tables || tables.length === 0) {
    tableCards.innerHTML = '<div class="muted">진행 중 주문이 없습니다.</div>';
    return;
  }

  for (const table of tables) {
    const card = document.createElement('article');
    card.className = `table-card ${highlight ? 'new' : ''}`;
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <div><strong>Table ${table.tableNumber}</strong></div>
      <div>총 주문액: <strong>${formatCurrency(table.totalAmount)}</strong></div>
      <div class="muted">주문 ${table.orderCount}건</div>
    `;
    card.addEventListener('click', () => showTableOrderDetail(table));

    const previewWrap = document.createElement('div');
    for (const order of table.latestOrders) {
      const preview = document.createElement('div');
      preview.className = 'order-preview';
      preview.style.cursor = 'pointer';
      preview.innerHTML = `
        <div><strong>${order.orderNumber}</strong> <span class="status-pill status-${order.status}">${order.status}</span></div>
        <div class="muted">${new Date(order.createdAt).toLocaleString()}</div>
        <div>${order.items.map((item) => `${item.menuName} x${item.quantity}`).join(', ')}</div>
      `;
      preview.addEventListener('click', (event) => {
        event.stopPropagation();
        showSingleOrderDetail(order);
      });

      const actions = document.createElement('div');
      actions.className = 'inline-actions';

      const waitButton = document.createElement('button');
      waitButton.textContent = '대기';
      waitButton.addEventListener('click', (event) => {
        event.stopPropagation();
        changeStatus(order.orderId, '대기중');
      });

      const prepButton = document.createElement('button');
      prepButton.textContent = '준비';
      prepButton.addEventListener('click', (event) => {
        event.stopPropagation();
        changeStatus(order.orderId, '준비중');
      });

      const doneButton = document.createElement('button');
      doneButton.textContent = '완료';
      doneButton.addEventListener('click', (event) => {
        event.stopPropagation();
        changeStatus(order.orderId, '완료');
      });

      const deleteButton = document.createElement('button');
      deleteButton.className = 'btn-danger';
      deleteButton.textContent = '삭제';
      deleteButton.addEventListener('click', (event) => {
        event.stopPropagation();
        deleteOrder(order.orderId);
      });

      actions.append(waitButton, prepButton, doneButton, deleteButton);
      preview.appendChild(actions);
      previewWrap.appendChild(preview);
    }

    const completeButton = document.createElement('button');
    completeButton.className = 'btn-secondary';
    completeButton.textContent = `Table ${table.tableNumber} 이용 완료`;
    completeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      completeSession(table.tableNumber);
    });

    card.append(previewWrap, completeButton);
    tableCards.appendChild(card);
  }
}

async function refreshDashboard(highlight = false) {
  const result = await api('/api/admin/dashboard/orders');
  const keyword = tableFilterInput.value.trim().toLowerCase();
  const filteredTables = (result.tables || []).filter((table) =>
    keyword ? table.tableNumber.toLowerCase().includes(keyword) : true
  );
  renderTableCards(filteredTables, highlight);

  if (highlight) {
    clearTimeout(highlightTimer);
    highlightTimer = setTimeout(() => {
      document.querySelectorAll('.table-card').forEach((card) => card.classList.remove('new'));
    }, 1500);
  }
}

async function changeStatus(orderId, status) {
  try {
    await api(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    await refreshDashboard();
  } catch (error) {
    setToast(loginToast, error.message, true);
  }
}

async function deleteOrder(orderId) {
  const confirmed = window.confirm('주문을 삭제하시겠습니까?');
  if (!confirmed) {
    return;
  }

  try {
    await api(`/api/admin/orders/${orderId}`, { method: 'DELETE' });
    await refreshDashboard();
  } catch (error) {
    setToast(loginToast, error.message, true);
  }
}

async function completeSession(tableNumber) {
  const confirmed = window.confirm(`Table ${tableNumber} 세션을 종료하시겠습니까?`);
  if (!confirmed) {
    return;
  }

  try {
    const result = await api(`/api/admin/tables/${tableNumber}/session/complete`, {
      method: 'POST'
    });
    setToast(loginToast, `${tableNumber} 세션 종료 (${result.movedOrders}건 이관)`);
    await refreshDashboard();
  } catch (error) {
    setToast(loginToast, error.message, true);
  }
}

async function setupTable() {
  const tableNumber = setupTableNumberInput.value.trim();
  const tablePassword = setupTablePasswordInput.value.trim();
  if (!tableNumber || !tablePassword) {
    setToast(setupTableToast, '테이블 번호와 비밀번호를 입력하세요.', true);
    return;
  }

  try {
    const result = await api('/api/admin/tables/setup', {
      method: 'POST',
      body: JSON.stringify({ tableNumber, tablePassword })
    });
    if (result?.tableLogin?.token) {
      setToast(setupTableToast, `${tableNumber} 설정 저장 완료 (16시간 자동로그인 토큰 발급)`);
    } else {
      setToast(setupTableToast, `${tableNumber} 설정 저장 완료`);
    }
  } catch (error) {
    setToast(setupTableToast, error.message, true);
  }
}

async function loadHistory() {
  const tableNumber = historyTableInput.value.trim();
  if (!tableNumber) {
    setToast(loginToast, '조회할 테이블 번호를 입력하세요.', true);
    return;
  }

  const date = historyDateInput.value;
  const query = date ? `?date=${encodeURIComponent(date)}` : '';
  try {
    const result = await api(`/api/admin/tables/${tableNumber}/history${query}`);
    historyList.innerHTML = '';

    if ((result.items || []).length === 0) {
      historyList.innerHTML = '<div class="muted">과거 내역이 없습니다.</div>';
      return;
    }

    for (const history of result.items) {
      const total = history.orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const orderDetails = history.orders
        .map((order) => {
          const itemLines = order.items.map((item) => `${item.menuName} x${item.quantity}`).join(', ');
          return `<li>${order.orderNumber} · ${new Date(order.createdAt).toLocaleString()} · ${itemLines} · ${formatCurrency(order.totalAmount)}</li>`;
        })
        .join('');
      const div = document.createElement('div');
      div.className = 'order-item';
      div.innerHTML = `
        <div><strong>Session ${history.sessionId}</strong></div>
        <div class="muted">완료 시각: ${new Date(history.completedAt).toLocaleString()}</div>
        <div>주문수: ${history.orders.length}건 / 합계: ${formatCurrency(total)}</div>
        <ul>${orderDetails}</ul>
      `;
      historyList.appendChild(div);
    }
  } catch (error) {
    setToast(loginToast, error.message, true);
  }
}

function renderMenus(items) {
  menuList.innerHTML = '';
  if (!items || items.length === 0) {
    menuList.innerHTML = '<div class="muted">등록된 메뉴가 없습니다.</div>';
    return;
  }

  for (const menu of items) {
    const div = document.createElement('div');
    div.className = 'order-item';
    div.innerHTML = `
      <div><strong>${menu.name}</strong> (${menu.category})</div>
      <div>${formatCurrency(menu.price)} · 순서 ${menu.displayOrder ?? '-'}</div>
      <div class="muted">${menu.description || ''}</div>
    `;

    const actions = document.createElement('div');
    actions.className = 'inline-actions';

    const editButton = document.createElement('button');
    editButton.textContent = '수정';
    editButton.addEventListener('click', async () => {
      const name = window.prompt('메뉴명', menu.name);
      if (!name) return;
      const price = Number(window.prompt('가격', String(menu.price)));
      const category = window.prompt('카테고리', menu.category);
      const description = window.prompt('설명', menu.description || '');
      try {
        await api(`/api/admin/menus/${menu.menuId}`, {
          method: 'PUT',
          body: JSON.stringify({ name, price, category, description })
        });
        await loadMenus();
      } catch (error) {
        setToast(menuToast, error.message, true);
      }
    });

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn-danger';
    deleteButton.textContent = '삭제';
    deleteButton.addEventListener('click', async () => {
      if (!window.confirm('메뉴를 삭제하시겠습니까?')) {
        return;
      }
      try {
        await api(`/api/admin/menus/${menu.menuId}`, { method: 'DELETE' });
        await loadMenus();
      } catch (error) {
        setToast(menuToast, error.message, true);
      }
    });

    actions.append(editButton, deleteButton);
    div.appendChild(actions);
    menuList.appendChild(div);
  }
}

async function loadMenus() {
  const result = await api('/api/admin/menus');
  renderMenus(result.items || []);
}

async function createMenu() {
  const payload = {
    name: menuName.value.trim(),
    price: Number(menuPrice.value),
    category: menuCategory.value.trim(),
    description: menuDescription.value.trim(),
    imageUrl: menuImageUrl.value.trim(),
    displayOrder: Number(menuDisplayOrder.value || 0) || undefined
  };

  try {
    await api('/api/admin/menus', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    setToast(menuToast, '메뉴 등록 완료');
    await loadMenus();
  } catch (error) {
    setToast(menuToast, error.message, true);
  }
}

async function startSse() {
  if (!token) {
    return;
  }

  if (sseController) {
    sseController.abort();
  }
  sseController = new AbortController();

  try {
    const response = await fetch('/api/admin/orders/stream', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      signal: sseController.signal
    });

    if (!response.ok || !response.body) {
      throw new Error('SSE 연결 실패');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split('\n\n');
      buffer = chunks.pop() || '';
      if (chunks.length > 0) {
        await refreshDashboard(true);
      }
    }
  } catch {
    // reconnect in background
    setTimeout(() => startSse(), 3000);
  }
}

adminLoginButton.addEventListener('click', async () => {
  try {
    await loginAdmin();
  } catch (error) {
    setToast(loginToast, error.message, true);
  }
});

refreshDashboardButton.addEventListener('click', async () => {
  try {
    await refreshDashboard();
  } catch (error) {
    setToast(loginToast, error.message, true);
  }
});

historyButton.addEventListener('click', loadHistory);
historyCloseButton.addEventListener('click', () => {
  historyList.innerHTML = '';
});
menuCreateButton.addEventListener('click', createMenu);
setupTableButton.addEventListener('click', setupTable);
tableFilterInput.addEventListener('input', () => {
  refreshDashboard().catch(() => {
    // ignore filter refresh errors
  });
});

async function bootstrap() {
  if (!token) {
    setBadge('로그인 필요', false);
    return;
  }

  loginSection.classList.add('hidden');
  adminApp.classList.remove('hidden');
  setBadge('운영 세션 연결', true);

  try {
    await refreshDashboard();
    await loadMenus();
    scheduleAutoLogout();
    startSse();
  } catch {
    logoutAdminSession('세션을 복구할 수 없어 다시 로그인합니다.');
  }
}

bootstrap();
