# Contract/Interface Definition - Backend

## Unit Context
- **Stories**: US-C01, US-C02, US-C04, US-C05, US-A01, US-A02, US-A03, US-A04
- **Dependencies**: PostgreSQL
- **Database Entities**: Store, Admin, StoreTable, Category, Menu, Order, OrderItem, OrderHistory

---

## Entity Layer

### Store
- `id: Long`, `storeIdentifier: String`, `name: String`, `createdAt: LocalDateTime`

### Admin
- `id: Long`, `storeId: Long`, `username: String`, `passwordHash: String`, `loginAttempts: Integer`, `lockedUntil: LocalDateTime`

### StoreTable
- `id: Long`, `storeId: Long`, `tableNumber: Integer`, `passwordHash: String`, `currentSessionId: String`, `sessionStartedAt: LocalDateTime`

### Category
- `id: Long`, `storeId: Long`, `name: String`, `displayOrder: Integer`

### Menu
- `id: Long`, `categoryId: Long`, `name: String`, `price: Integer`, `description: String`, `imageUrl: String`, `displayOrder: Integer`, `createdAt: LocalDateTime`

### Order
- `id: Long`, `tableId: Long`, `sessionId: String`, `totalAmount: Integer`, `status: OrderStatus`, `createdAt: LocalDateTime`

### OrderItem
- `id: Long`, `orderId: Long`, `menuId: Long`, `menuName: String`, `quantity: Integer`, `unitPrice: Integer`

### OrderHistory
- `id: Long`, `tableId: Long`, `sessionId: String`, `orderData: String(JSON)`, `totalAmount: Integer`, `orderedAt: LocalDateTime`, `completedAt: LocalDateTime`

---

## Repository Layer

### StoreRepository
- `findByStoreIdentifier(storeIdentifier: String)` → Optional<Store>

### AdminRepository
- `findByStoreIdAndUsername(storeId: Long, username: String)` → Optional<Admin>

### StoreTableRepository
- `findByStoreIdAndTableNumber(storeId: Long, tableNumber: Integer)` → Optional<StoreTable>
- `findAllByStoreId(storeId: Long)` → List<StoreTable>

### CategoryRepository
- `findAllByStoreIdOrderByDisplayOrder(storeId: Long)` → List<Category>

### MenuRepository
- `findAllByCategoryIdOrderByDisplayOrder(categoryId: Long)` → List<Menu>
- `findMaxDisplayOrderByCategoryId(categoryId: Long)` → Optional<Integer>

### OrderRepository
- `findAllByTableIdAndSessionIdOrderByCreatedAtDesc(tableId: Long, sessionId: String, pageable: Pageable)` → Page<Order>
- `findAllByTableIdAndSessionId(tableId: Long, sessionId: String)` → List<Order>
- `deleteAllByTableIdAndSessionId(tableId: Long, sessionId: String)` → void

### OrderItemRepository
- `findAllByOrderId(orderId: Long)` → List<OrderItem>
- `deleteAllByOrderId(orderId: Long)` → void

### OrderHistoryRepository
- `findAllByTableIdOrderByCompletedAtDesc(tableId: Long)` → List<OrderHistory>
- `findAllByTableIdAndCompletedAtBetween(tableId: Long, start: LocalDateTime, end: LocalDateTime)` → List<OrderHistory>

---

## Business Logic Layer

### AuthService
- `loginAdmin(storeIdentifier: String, username: String, password: String)` → TokenResponse
  - Raises: InvalidCredentialsException, AccountLockedException
- `loginTable(storeIdentifier: String, tableNumber: Integer, password: String)` → TokenResponse
  - Raises: InvalidCredentialsException

### MenuService
- `getCategories(storeId: Long)` → List<Category>
- `getMenusByCategory(categoryId: Long)` → List<Menu>
- `createMenu(storeId: Long, request: CreateMenuRequest)` → Menu
  - Raises: ValidationException, CategoryNotFoundException
- `updateMenu(menuId: Long, request: UpdateMenuRequest)` → Menu
  - Raises: MenuNotFoundException, ValidationException
- `deleteMenu(menuId: Long)` → void
  - Raises: MenuNotFoundException
- `reorderMenus(request: ReorderRequest)` → void

### OrderService
- `createOrder(tableId: Long, request: CreateOrderRequest)` → Order
  - Raises: TableNotFoundException, MenuNotFoundException
- `getOrdersBySession(tableId: Long, sessionId: String, pageable: Pageable)` → Page<Order>
- `getActiveOrders(tableId: Long)` → List<Order>
- `updateOrderStatus(orderId: Long, newStatus: OrderStatus)` → Order
  - Raises: OrderNotFoundException, InvalidStatusTransitionException
- `deleteOrder(orderId: Long)` → void
  - Raises: OrderNotFoundException

### TableService
- `createTable(storeId: Long, tableNumber: Integer, password: String)` → StoreTable
- `getTables(storeId: Long)` → List<StoreTable>
- `getTableSummary(tableId: Long)` → TableSummaryResponse
- `completeTable(tableId: Long)` → void
  - Raises: TableNotFoundException, NoActiveSessionException
- `getOrderHistory(tableId: Long, startDate: LocalDate, endDate: LocalDate)` → List<OrderHistory>

### SseService
- `createAdminEmitter()` → SseEmitter
- `createTableEmitter(tableId: Long)` → SseEmitter
- `broadcastNewOrder(order: Order)` → void
- `broadcastOrderStatusChange(order: Order)` → void
- `broadcastOrderDeleted(orderId: Long, tableId: Long)` → void
- `broadcastTableCompleted(tableId: Long)` → void

### JwtTokenProvider
- `generateToken(subject: String, role: String)` → String
- `validateToken(token: String)` → boolean
- `getSubject(token: String)` → String
- `getRole(token: String)` → String

---

## API Layer

### AuthController
- `POST /api/auth/admin/login` → TokenResponse
- `POST /api/auth/table/login` → TokenResponse

### MenuController
- `GET /api/categories` → List<CategoryResponse>
- `GET /api/menus?categoryId={id}` → List<MenuResponse>
- `POST /api/menus` → MenuResponse (ADMIN)
- `PUT /api/menus/{id}` → MenuResponse (ADMIN)
- `DELETE /api/menus/{id}` → void (ADMIN)
- `PUT /api/menus/reorder` → void (ADMIN)

### OrderController
- `POST /api/orders` → OrderResponse (TABLE)
- `GET /api/orders?tableId={id}&sessionId={sid}&page={p}&size={s}` → Page<OrderResponse> (TABLE)
- `GET /api/orders/table/{tableId}/active` → List<OrderResponse> (ADMIN)
- `PUT /api/orders/{id}/status` → OrderResponse (ADMIN)
- `DELETE /api/orders/{id}` → void (ADMIN)

### TableController
- `POST /api/tables` → TableResponse (ADMIN)
- `GET /api/tables` → List<TableResponse> (ADMIN)
- `GET /api/tables/{id}/summary` → TableSummaryResponse (ADMIN)
- `POST /api/tables/{id}/complete` → void (ADMIN)
- `GET /api/tables/{id}/history?startDate={}&endDate={}` → List<OrderHistoryResponse> (ADMIN)

### SseController
- `GET /api/sse/admin` → SseEmitter (ADMIN)
- `GET /api/sse/table/{tableId}` → SseEmitter (TABLE)
