# User Stories

## Epic C1: Customer Access and Session
### Story C1-1
As a Table Customer, I want one-time table setup and auto login, so that I can order immediately without repeated login.

Acceptance Criteria
- 초기 설정에서 storeId, tableNumber, tablePassword 입력 가능
- 성공 시 local 저장
- 이후 앱 재진입 시 자동 로그인 수행

## Epic C2: Menu and Cart
### Story C2-1
As a Table Customer, I want category-based menu browsing, so that I can find items quickly.

Acceptance Criteria
- 메뉴 기본 화면 제공
- category 필터/탭 이동 가능
- 메뉴 카드에 name/price/description/image 표시

### Story C2-2
As a Table Customer, I want a persistent cart, so that I can review and adjust before ordering.

Acceptance Criteria
- add/remove/quantity 조절 가능
- 총 금액 실시간 계산
- 새로고침 후에도 cart 유지

## Epic C3: Order Lifecycle
### Story C3-1
As a Table Customer, I want to place an order and see confirmation, so that I can trust order completion.

Acceptance Criteria
- 주문 전 최종 확인 가능
- 성공 시 order number 표시
- 성공 후 cart clear 및 5초 후 메뉴로 이동
- 실패 시 오류 표시, cart 보존

### Story C3-2
As a Table Customer, I want to see my current session order history, so that I can track ordered items.

Acceptance Criteria
- 현재 table session 주문만 조회
- order number/time/items/amount/status 표시
- 완료된 과거 세션 주문은 제외

## Epic A1: Admin Authentication
### Story A1-1
As a Store Admin, I want secure login with long session, so that I can manage the store without frequent re-login.

Acceptance Criteria
- storeId/username/password 인증
- 토큰 기반 16시간 session 유지
- 로그인 실패 누적 제한 적용

## Epic A2: Real-time Order Monitoring
### Story A2-1
As a Store Admin, I want real-time order dashboard, so that I can process new orders quickly.

Acceptance Criteria
- SSE로 신규/변경 주문 반영
- 테이블별 카드 그리드 제공
- 테이블 총 주문액 및 최신 주문 preview 제공
- 신규 주문 강조 표시

### Story A2-2
As a Store Admin, I want to change order status and view details, so that kitchen progress can be tracked.

Acceptance Criteria
- 주문 상세 보기 가능
- status를 대기중/준비중/완료로 변경 가능

## Epic A3: Table Session Control
### Story A3-1
As a Store Admin, I want to delete mistaken orders, so that totals remain accurate.

Acceptance Criteria
- 삭제 확인 후 즉시 삭제
- 테이블 합계 즉시 재계산

### Story A3-2
As a Store Admin, I want to close table sessions and archive orders, so that next customer starts cleanly.

Acceptance Criteria
- session complete 처리 가능
- 완료 시 현재 주문/합계 reset
- session 주문은 history로 이동

### Story A3-3
As a Store Admin, I want to view table history by date, so that I can audit past sessions.

Acceptance Criteria
- table별 과거 주문 목록 조회
- date filter 적용 가능

## Epic A4: Menu Management
### Story A4-1
As a Store Admin, I want menu CRUD operations, so that I can keep menu up to date.

Acceptance Criteria
- 메뉴 조회/등록/수정/삭제 가능
- category와 노출순서 관리
- 필수 항목 및 가격 검증
