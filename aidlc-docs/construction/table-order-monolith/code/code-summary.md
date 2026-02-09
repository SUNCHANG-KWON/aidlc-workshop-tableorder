# Code Generation Summary - table-order-monolith

## Created Files

### Application Code
- `package.json`
- `src/index.js`
- `src/app.js`
- `src/lib/errors.js`
- `src/lib/http.js`
- `src/lib/jwt.js`
- `src/lib/password.js`
- `src/services/data-store.js`
- `src/services/auth-service.js`
- `src/services/menu-service.js`
- `src/services/order-service.js`
- `src/services/table-session-service.js`
- `src/services/sse-hub.js`

### Frontend
- `public/customer.html`
- `public/customer.js`
- `public/admin.html`
- `public/admin.js`
- `public/styles.css`

### Tests
- `tests/jwt.test.js`
- `tests/password.test.js`
- `tests/api.test.js`

## Story Coverage
- C1-1: table auto login -> `POST /api/table/login`, `public/customer.js`
- C2-1/C2-2: menu/cart -> `GET /api/menu`, cart localStorage 로직
- C3-1/C3-2: 주문 생성/세션 주문조회 -> `POST /api/orders`, `GET /api/orders/current-session`
- A1-1: admin login/session -> `POST /api/admin/login`, JWT 16h
- A2-1/A2-2: SSE dashboard/status 변경 -> `/api/admin/orders/stream`, `PATCH /api/admin/orders/:id/status`
- A3-1/A3-2/A3-3: 삭제/세션완료/히스토리 -> delete, session complete, history endpoints
- A4-1: 메뉴 CRUD -> `/api/admin/menus*`

## Known Gaps
- password hash는 `bcrypt` 대신 `scrypt` 사용 (Node built-in dependency-free)
- 실운영용 DB/분산 SSE/고가용성은 MVP 범위 밖

## Post-Delivery Enhancements
- Customer history switched to SSE-driven refresh with pagination("더보기")
- Session start moved to first order creation (not login)
- Admin dashboard enhancements:
  - table filter
  - order card click detail view
  - table setup UI/API
  - history close button + detailed order rows
  - token-exp based auto logout
- Password security:
  - bcrypt hashing/verification
  - legacy scrypt hash auto-upgrade on successful admin login
