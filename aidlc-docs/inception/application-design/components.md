# Components

## ApiRouter
- Purpose: HTTP routing 및 request validation
- Responsibilities:
  - customer/admin API endpoint dispatch
  - 인증 context 주입

## AuthComponent
- Purpose: admin/table authentication 및 token 발급
- Responsibilities:
  - password 검증
  - JWT sign/verify
  - login attempt throttling

## MenuComponent
- Purpose: menu 조회/관리
- Responsibilities:
  - category 기반 조회
  - CRUD 및 validation

## OrderComponent
- Purpose: 주문 생성/조회/상태 변경/삭제
- Responsibilities:
  - order number 생성
  - session scope filtering
  - status transition

## TableSessionComponent
- Purpose: table session lifecycle 관리
- Responsibilities:
  - active session 생성/조회
  - session complete 처리
  - history 이동

## SseComponent
- Purpose: admin dashboard 실시간 업데이트
- Responsibilities:
  - SSE channel 유지
  - order update broadcast

## PersistenceComponent
- Purpose: JSON 파일 기반 영속 저장
- Responsibilities:
  - load/save transaction
  - ID sequence 관리
