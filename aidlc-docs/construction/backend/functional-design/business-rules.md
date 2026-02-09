# Business Rules - Backend

## BR-01: 인증

### BR-01-1: 관리자 로그인
- 매장 식별자 + 사용자명 + 비밀번호로 인증
- 비밀번호는 bcrypt로 검증
- 성공 시 JWT 토큰 발급 (만료: 16시간, role: ADMIN)
- 실패 시 loginAttempts 증가

### BR-01-2: 로그인 시도 제한
- 5회 연속 실패 시 계정 잠금 (15분)
- lockedUntil 시각 이전에는 로그인 시도 거부
- 성공 시 loginAttempts 0으로 리셋

### BR-01-3: 테이블 로그인
- 매장 식별자 + 테이블 번호 + 비밀번호로 인증
- 성공 시 JWT 토큰 발급 (만료: 16시간, role: TABLE, subject: tableId)

## BR-02: 메뉴

### BR-02-1: 메뉴 등록 검증
- 필수: name, price, categoryId
- price: 0 이상 정수
- categoryId: 존재하는 카테고리여야 함
- displayOrder: 미지정 시 해당 카테고리 내 마지막 순서 + 1

### BR-02-2: 메뉴 삭제
- 메뉴 삭제 시 기존 주문의 OrderItem은 유지 (스냅샷 데이터)

### BR-02-3: 메뉴 순서 변경
- 요청: [{menuId, displayOrder}] 배열
- 같은 카테고리 내에서만 순서 변경 가능

## BR-03: 주문

### BR-03-1: 주문 생성
- 최소 1개 이상의 OrderItem 필요
- 각 OrderItem: menuId 존재 확인, quantity >= 1
- totalAmount = sum(unitPrice * quantity)
- 주문 시점의 메뉴명/단가를 OrderItem에 스냅샷 저장
- 생성 시 status = PENDING

### BR-03-2: 세션 자동 시작
- 주문 생성 시 해당 테이블의 currentSessionId가 null이면:
  - 새 UUID 생성하여 currentSessionId에 설정
  - sessionStartedAt = 현재 시각
- 주문의 sessionId = 테이블의 currentSessionId

### BR-03-3: 주문 상태 전이
- 허용 전이: PENDING → PREPARING → COMPLETED
- 역방향 전이 불가 (COMPLETED → PREPARING 등)
- 잘못된 전이 시 에러 반환

### BR-03-4: 주문 삭제
- 관리자만 삭제 가능
- 삭제 후 해당 테이블의 활성 주문 총액 재계산

## BR-04: 테이블 세션

### BR-04-1: 이용 완료 처리
1. 해당 테이블의 활성 주문(currentSessionId 기준) 전체 조회
2. 각 주문을 OrderHistory로 변환하여 저장
   - orderData: 주문 상세 JSON (주문번호, 메뉴목록, 수량, 금액)
   - completedAt: 현재 시각
3. 활성 주문 및 OrderItem 삭제
4. 테이블의 currentSessionId = null, sessionStartedAt = null
5. 전체 과정은 단일 트랜잭션

### BR-04-2: 과거 내역 조회
- tableId 기준 OrderHistory 조회
- completedAt 기준 시간 역순 정렬
- 날짜 필터링: startDate ~ endDate (선택)

## BR-05: SSE 이벤트

### BR-05-1: 이벤트 타입
| 이벤트 | 대상 | 데이터 |
|--------|------|--------|
| NEW_ORDER | 관리자 | 주문 정보 (테이블번호, 주문내역, 금액) |
| ORDER_STATUS_CHANGED | 관리자 + 해당 테이블 | 주문ID, 새 상태 |
| ORDER_DELETED | 관리자 + 해당 테이블 | 주문ID, 테이블ID |
| TABLE_COMPLETED | 관리자 + 해당 테이블 | 테이블ID |

### BR-05-2: SSE 연결 관리
- emitter timeout: 30분 (재연결 시 새 emitter)
- 연결 끊김 시 emitter 자동 제거
