# Component Methods

> 비즈니스 규칙 상세는 Functional Design에서 정의. 여기서는 시그니처와 목적만 정의.

## AuthController
- `POST /api/auth/admin/login` → AdminLoginRequest → TokenResponse: 관리자 로그인
- `POST /api/auth/table/login` → TableLoginRequest → TokenResponse: 테이블 태블릿 로그인

## AuthService
- `loginAdmin(storeId, username, password)` → TokenResponse: 관리자 인증 및 JWT 발급
- `loginTable(storeId, tableNumber, password)` → TokenResponse: 테이블 인증 및 JWT 발급

## MenuController
- `GET /api/categories` → List<CategoryResponse>: 카테고리 목록 조회
- `GET /api/menus?categoryId={id}` → List<MenuResponse>: 카테고리별 메뉴 조회
- `GET /api/menus/{id}` → MenuResponse: 메뉴 상세 조회
- `POST /api/menus` → CreateMenuRequest → MenuResponse: 메뉴 등록 (관리자)
- `PUT /api/menus/{id}` → UpdateMenuRequest → MenuResponse: 메뉴 수정 (관리자)
- `DELETE /api/menus/{id}` → void: 메뉴 삭제 (관리자)
- `PUT /api/menus/reorder` → ReorderRequest → void: 메뉴 순서 변경 (관리자)

## MenuService
- `getCategories()` → List<Category>: 카테고리 목록
- `getMenusByCategory(categoryId)` → List<Menu>: 카테고리별 메뉴
- `createMenu(request)` → Menu: 메뉴 생성 (검증 포함)
- `updateMenu(id, request)` → Menu: 메뉴 수정
- `deleteMenu(id)` → void: 메뉴 삭제
- `reorderMenus(request)` → void: 순서 변경

## OrderController
- `POST /api/orders` → CreateOrderRequest → OrderResponse: 주문 생성 (고객)
- `GET /api/orders?tableId={id}&sessionId={sid}&page={p}&size={s}` → Page<OrderResponse>: 테이블 세션별 주문 조회 (페이지네이션)
- `GET /api/orders/table/{tableId}/active` → List<OrderResponse>: 테이블 활성 주문 조회 (관리자)
- `PUT /api/orders/{id}/status` → UpdateStatusRequest → OrderResponse: 주문 상태 변경 (관리자)
- `DELETE /api/orders/{id}` → void: 주문 삭제 (관리자)

## OrderService
- `createOrder(tableId, sessionId, items)` → Order: 주문 생성
- `getOrdersBySession(tableId, sessionId, page, size)` → Page<Order>: 세션별 주문 조회 (페이지네이션)
- `getActiveOrders(tableId)` → List<Order>: 활성 주문 조회
- `updateOrderStatus(orderId, status)` → Order: 상태 변경 + SSE 이벤트 발행
- `deleteOrder(orderId)` → void: 주문 삭제 + 총액 재계산

## TableController
- `POST /api/tables` → CreateTableRequest → TableResponse: 테이블 등록 + 16시간 세션 생성 (관리자)
- `GET /api/tables` → List<TableResponse>: 테이블 목록 조회
- `GET /api/tables/{id}/summary` → TableSummaryResponse: 테이블 요약 (총 주문액, 최신 주문)
- `POST /api/tables/{id}/complete` → void: 이용 완료 처리 (관리자)
- `GET /api/tables/{id}/history` → List<OrderHistoryResponse>: 과거 주문 내역 조회

## TableService
- `createTable(tableNumber, password)` → Table: 테이블 등록 + 16시간 세션 생성
- `getTables()` → List<Table>: 테이블 목록
- `getTableSummary(tableId)` → TableSummary: 테이블 요약 정보
- `completeTable(tableId)` → void: 이용 완료 (세션 종료, 이력 이동, 리셋)
- `getOrderHistory(tableId, dateFilter)` → List<OrderHistory>: 과거 내역 조회

## SseController
- `GET /api/sse/admin` → SseEmitter: 관리자 SSE 연결
- `GET /api/sse/table/{tableId}` → SseEmitter: 고객 테이블별 SSE 연결

## SseService
- `createAdminEmitter()` → SseEmitter: 관리자 emitter 생성/등록
- `createTableEmitter(tableId)` → SseEmitter: 테이블 emitter 생성/등록
- `broadcastNewOrder(order)` → void: 신규 주문 이벤트 (관리자)
- `broadcastOrderStatusChange(order)` → void: 주문 상태 변경 이벤트 (관리자 + 해당 테이블)
- `broadcastOrderDeleted(orderId, tableId)` → void: 주문 삭제 이벤트

## JwtTokenProvider
- `generateToken(subject, role, expiration)` → String: 토큰 생성
- `validateToken(token)` → boolean: 토큰 검증
- `getSubject(token)` → String: subject 추출
- `getRole(token)` → String: role 추출
