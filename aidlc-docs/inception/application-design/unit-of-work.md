# Unit of Work

## Unit: table-order-monolith
- Type: Greenfield monolith
- Responsibility:
  - customer web app 제공
  - admin web app 제공
  - API + auth + SSE + data persistence 제공

## Internal Modules
- `src/lib`: 공통 유틸(token, password, http/json)
- `src/services`: domain logic(auth/menu/order/table)
- `src`: server composition
- `public`: customer/admin UI
- `tests`: unit/integration tests

## Code Organization Strategy
- Application code: workspace root
- Documentation: `aidlc-docs/`
- Tests: Node built-in `node:test` 기반
