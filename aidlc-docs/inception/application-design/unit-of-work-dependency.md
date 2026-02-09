# Unit of Work Dependency

## Units
- table-order-monolith (single unit)

## Dependency
- External dependency 없음 (Node built-in module 중심)
- 내부 dependency:
  - Router -> Services -> DataStore
  - Services -> SSE Hub
