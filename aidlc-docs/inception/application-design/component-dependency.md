# Component Dependency

## Dependency Matrix
- ApiRouter -> AuthComponent
- ApiRouter -> CustomerService
- ApiRouter -> AdminService
- CustomerService -> MenuComponent
- CustomerService -> OrderComponent
- CustomerService -> TableSessionComponent
- AdminService -> MenuComponent
- AdminService -> OrderComponent
- AdminService -> TableSessionComponent
- AdminService -> SseComponent
- All Services -> PersistenceComponent

## Communication Pattern
- Synchronous HTTP for CRUD/read
- Server-Sent Events for admin real-time updates
- Session-bound filtering using token claims (`storeId`, `tableNumber`, `sessionId`, `role`)
