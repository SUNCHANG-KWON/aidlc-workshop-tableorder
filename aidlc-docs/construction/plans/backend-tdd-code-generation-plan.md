# TDD Code Generation Plan - Backend

## Unit Context
- **Workspace Root**: /home/kwonsc/workspace/aidlc-workshop-tableorder
- **Project Type**: Greenfield (multi-unit monolith)
- **Code Location**: `backend/`
- **Stories**: US-C01, US-C02, US-C04, US-C05, US-A01, US-A02, US-A03, US-A04

---

### Plan Step 0: Project Structure + Contract Skeleton
- [ ] Gradle 프로젝트 초기화 (build.gradle.kts, settings.gradle.kts)
- [ ] application.yml 설정
- [ ] Entity 클래스 생성 (Store, Admin, StoreTable, Category, Menu, Order, OrderItem, OrderHistory, OrderStatus)
- [ ] Repository 인터페이스 생성
- [ ] Service 클래스 스켈레톤 (모든 메서드 throw UnsupportedOperationException)
- [ ] Controller 클래스 스켈레톤
- [ ] DTO 클래스 생성 (Request/Response)
- [ ] Exception 클래스 생성
- [ ] Security 설정 스켈레톤 (JwtTokenProvider, JwtAuthenticationFilter, SecurityConfig)
- [ ] Flyway 마이그레이션 스크립트 (V1__init.sql)
- [ ] Dockerfile

### Plan Step 1: Security Layer (TDD)
- [ ] JwtTokenProvider.generateToken() - RED-GREEN-REFACTOR (TC-JWT-001)
- [ ] JwtTokenProvider.validateToken() - RED-GREEN-REFACTOR (TC-JWT-002)

### Plan Step 2: Business Logic - AuthService (TDD)
- [ ] AuthService.loginAdmin() 성공 - RED-GREEN-REFACTOR (TC-AUTH-001)
- [ ] AuthService.loginAdmin() 실패 - RED-GREEN-REFACTOR (TC-AUTH-002)
- [ ] AuthService.loginAdmin() 잠금 - RED-GREEN-REFACTOR (TC-AUTH-003)
- [ ] AuthService.loginTable() - RED-GREEN-REFACTOR (TC-AUTH-004)

### Plan Step 3: Business Logic - MenuService (TDD)
- [ ] MenuService.getCategories() - RED-GREEN-REFACTOR (TC-MENU-001)
- [ ] MenuService.createMenu() 성공 - RED-GREEN-REFACTOR (TC-MENU-002)
- [ ] MenuService.createMenu() 검증 실패 - RED-GREEN-REFACTOR (TC-MENU-003)
- [ ] MenuService.deleteMenu() - RED-GREEN-REFACTOR (TC-MENU-004)
- [ ] MenuService.reorderMenus() - RED-GREEN-REFACTOR (TC-MENU-005)

### Plan Step 4: Business Logic - OrderService (TDD)
- [ ] OrderService.createOrder() 첫 주문 - RED-GREEN-REFACTOR (TC-ORDER-001)
- [ ] OrderService.createOrder() 기존 세션 - RED-GREEN-REFACTOR (TC-ORDER-002)
- [ ] OrderService.updateOrderStatus() 성공 - RED-GREEN-REFACTOR (TC-ORDER-003)
- [ ] OrderService.updateOrderStatus() 실패 - RED-GREEN-REFACTOR (TC-ORDER-004)
- [ ] OrderService.deleteOrder() - RED-GREEN-REFACTOR (TC-ORDER-005)
- [ ] OrderService.getOrdersBySession() - RED-GREEN-REFACTOR (TC-ORDER-006)

### Plan Step 5: Business Logic - TableService (TDD)
- [ ] TableService.createTable() - RED-GREEN-REFACTOR (TC-TABLE-001)
- [ ] TableService.completeTable() 성공 - RED-GREEN-REFACTOR (TC-TABLE-002)
- [ ] TableService.completeTable() 실패 - RED-GREEN-REFACTOR (TC-TABLE-003)
- [ ] TableService.getOrderHistory() - RED-GREEN-REFACTOR (TC-TABLE-004)

### Plan Step 6: Business Logic - SseService (TDD)
- [ ] SseService.createAdminEmitter() - RED-GREEN-REFACTOR (TC-SSE-001)
- [ ] SseService.broadcastNewOrder() - RED-GREEN-REFACTOR (TC-SSE-002)

### Plan Step 7: API Layer - Controllers
- [ ] AuthController (POST /api/auth/admin/login, /api/auth/table/login)
- [ ] MenuController (GET/POST/PUT/DELETE /api/menus, GET /api/categories)
- [ ] OrderController (POST/GET/PUT/DELETE /api/orders)
- [ ] TableController (POST/GET /api/tables, POST complete, GET history)
- [ ] SseController (GET /api/sse/admin, /api/sse/table/{tableId})

### Plan Step 8: Security Configuration
- [ ] SecurityConfig (엔드포인트별 권한, CORS, JWT 필터)
- [ ] JwtAuthenticationFilter
- [ ] GlobalExceptionHandler

### Plan Step 9: Additional Artifacts
- [ ] Flyway 마이그레이션 최종 검증
- [ ] Dockerfile 최종 검증
- [ ] docker-compose.yml (backend + db)
