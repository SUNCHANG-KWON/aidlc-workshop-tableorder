# Component Dependencies

## 의존성 매트릭스

```
Controller Layer    →  Service Layer  →  Repository Layer
                                      →  SseService (이벤트)
```

| Component | 의존 대상 |
|-----------|----------|
| AuthController | AuthService |
| MenuController | MenuService |
| OrderController | OrderService |
| TableController | TableService |
| SseController | SseService |
| AuthService | StoreRepository, JwtTokenProvider |
| MenuService | MenuRepository, CategoryRepository |
| OrderService | OrderRepository, OrderItemRepository, TableService, SseService |
| TableService | TableRepository, OrderRepository, OrderHistoryRepository, SseService |
| SseService | (없음 - 독립) |
| JwtAuthenticationFilter | JwtTokenProvider |

## 통신 패턴

### Client → Server
- REST API (JSON): 모든 CRUD 작업
- JWT Bearer Token: 인증된 요청

### Server → Client (실시간)
- SSE: 관리자 대시보드 (신규 주문, 상태 변경, 주문 삭제)
- SSE: 고객 테이블 (주문 상태 변경)

## 데이터 흐름

```
고객 주문 생성:
  CustomerApp → OrderController → OrderService
    → OrderRepository (저장)
    → TableService (세션 자동 시작)
    → SseService (관리자에게 신규 주문 이벤트)

관리자 상태 변경:
  AdminApp → OrderController → OrderService
    → OrderRepository (상태 업데이트)
    → SseService (관리자 + 해당 테이블 고객에게 이벤트)

이용 완료:
  AdminApp → TableController → TableService
    → OrderRepository (활성 주문 조회)
    → OrderHistoryRepository (이력 저장)
    → OrderRepository (활성 주문 삭제)
    → TableRepository (세션 리셋)
    → SseService (관리자 + 해당 테이블에 이벤트)
```
