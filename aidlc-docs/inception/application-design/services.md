# Services

## CustomerService
- 구성: AuthComponent + MenuComponent + OrderComponent
- 역할: customer 인증/메뉴 조회/주문 생성/현재 세션 주문 조회

## AdminService
- 구성: AuthComponent + MenuComponent + OrderComponent + TableSessionComponent + SseComponent
- 역할: admin 인증, 주문 모니터링/상태변경/삭제, 세션 완료, history 조회, menu 관리

## PersistenceService
- 구성: PersistenceComponent
- 역할: 동시성 안전한 파일 read/write, seed data 보장
