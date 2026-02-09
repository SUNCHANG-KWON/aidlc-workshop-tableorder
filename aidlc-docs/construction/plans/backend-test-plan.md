# Test Plan - Backend

## Unit Overview
- **Unit**: table-order-backend
- **Stories**: US-C01, US-C02, US-C04, US-C05, US-A01, US-A02, US-A03, US-A04

---

## Business Logic Layer Tests

### AuthService

**TC-AUTH-001**: 유효한 관리자 로그인
- Given: 유효한 storeIdentifier, username, password
- When: loginAdmin() 호출
- Then: JWT 토큰이 포함된 TokenResponse 반환
- Story: US-A01 | Status: ⬜

**TC-AUTH-002**: 잘못된 비밀번호로 관리자 로그인
- Given: 유효한 storeIdentifier, username, 잘못된 password
- When: loginAdmin() 호출
- Then: InvalidCredentialsException, loginAttempts 증가
- Story: US-A01 | Status: ⬜

**TC-AUTH-003**: 5회 실패 후 계정 잠금
- Given: 5회 연속 로그인 실패한 Admin
- When: loginAdmin() 호출
- Then: AccountLockedException (15분 잠금)
- Story: US-A01 | Status: ⬜

**TC-AUTH-004**: 유효한 테이블 로그인
- Given: 유효한 storeIdentifier, tableNumber, password
- When: loginTable() 호출
- Then: JWT 토큰 반환 (role=TABLE)
- Story: US-C01 | Status: ⬜

### MenuService

**TC-MENU-001**: 카테고리 목록 조회
- Given: 매장에 카테고리 존재
- When: getCategories(storeId) 호출
- Then: displayOrder 순으로 카테고리 목록 반환
- Story: US-C02 | Status: ⬜

**TC-MENU-002**: 메뉴 등록 (유효)
- Given: 유효한 CreateMenuRequest
- When: createMenu() 호출
- Then: 메뉴 저장, displayOrder 자동 설정
- Story: US-A04 | Status: ⬜

**TC-MENU-003**: 메뉴 등록 (필수 필드 누락)
- Given: name 없는 CreateMenuRequest
- When: createMenu() 호출
- Then: ValidationException
- Story: US-A04 | Status: ⬜

**TC-MENU-004**: 메뉴 삭제
- Given: 존재하는 menuId
- When: deleteMenu() 호출
- Then: 메뉴 삭제됨
- Story: US-A04 | Status: ⬜

**TC-MENU-005**: 메뉴 순서 변경
- Given: 같은 카테고리의 메뉴 ID + 새 순서 목록
- When: reorderMenus() 호출
- Then: displayOrder 업데이트됨
- Story: US-A04 | Status: ⬜

### OrderService

**TC-ORDER-001**: 주문 생성 (첫 주문 - 세션 자동 시작)
- Given: currentSessionId가 null인 테이블, 유효한 메뉴 항목
- When: createOrder() 호출
- Then: 주문 생성, 세션 자동 시작 (UUID), 메뉴 스냅샷 저장
- Story: US-C04 | Status: ⬜

**TC-ORDER-002**: 주문 생성 (기존 세션)
- Given: 활성 세션이 있는 테이블
- When: createOrder() 호출
- Then: 기존 sessionId로 주문 생성
- Story: US-C04 | Status: ⬜

**TC-ORDER-003**: 주문 상태 전이 (PENDING → PREPARING)
- Given: PENDING 상태 주문
- When: updateOrderStatus(PREPARING) 호출
- Then: 상태 PREPARING으로 변경
- Story: US-A02 | Status: ⬜

**TC-ORDER-004**: 잘못된 상태 전이 (COMPLETED → PENDING)
- Given: COMPLETED 상태 주문
- When: updateOrderStatus(PENDING) 호출
- Then: InvalidStatusTransitionException
- Story: US-A02 | Status: ⬜

**TC-ORDER-005**: 주문 삭제
- Given: 존재하는 주문
- When: deleteOrder() 호출
- Then: 주문 + OrderItems 삭제
- Story: US-A03 | Status: ⬜

**TC-ORDER-006**: 세션별 주문 조회 (페이지네이션)
- Given: 세션에 주문 다수 존재
- When: getOrdersBySession(pageable) 호출
- Then: 페이지네이션된 주문 목록 반환
- Story: US-C05 | Status: ⬜

### TableService

**TC-TABLE-001**: 테이블 등록
- Given: 유효한 tableNumber, password
- When: createTable() 호출
- Then: 테이블 생성 (passwordHash bcrypt)
- Story: US-A03 | Status: ⬜

**TC-TABLE-002**: 이용 완료 처리
- Given: 활성 세션 + 주문이 있는 테이블
- When: completeTable() 호출
- Then: 주문→OrderHistory 이동, 테이블 리셋 (sessionId=null)
- Story: US-A03 | Status: ⬜

**TC-TABLE-003**: 이용 완료 (활성 세션 없음)
- Given: currentSessionId가 null인 테이블
- When: completeTable() 호출
- Then: NoActiveSessionException
- Story: US-A03 | Status: ⬜

**TC-TABLE-004**: 과거 내역 조회 (날짜 필터)
- Given: OrderHistory 존재
- When: getOrderHistory(tableId, startDate, endDate) 호출
- Then: 날짜 범위 내 이력 반환
- Story: US-A03 | Status: ⬜

### SseService

**TC-SSE-001**: 관리자 emitter 생성
- Given: -
- When: createAdminEmitter() 호출
- Then: SseEmitter 반환, 내부 목록에 등록
- Story: US-A02 | Status: ⬜

**TC-SSE-002**: 신규 주문 브로드캐스트
- Given: 등록된 관리자 emitter
- When: broadcastNewOrder() 호출
- Then: 관리자 emitter에 NEW_ORDER 이벤트 전송
- Story: US-A02 | Status: ⬜

### JwtTokenProvider

**TC-JWT-001**: 토큰 생성 및 검증
- Given: subject, role
- When: generateToken() → validateToken() 호출
- Then: true 반환, subject/role 추출 가능
- Story: US-A01 | Status: ⬜

**TC-JWT-002**: 만료된 토큰 검증
- Given: 만료된 토큰
- When: validateToken() 호출
- Then: false 반환
- Story: US-A01 | Status: ⬜

---

## Requirements Coverage

| Story | Test Cases | Status |
|-------|-----------|--------|
| US-C01 | TC-AUTH-004 | ⬜ |
| US-C02 | TC-MENU-001 | ⬜ |
| US-C04 | TC-ORDER-001, TC-ORDER-002 | ⬜ |
| US-C05 | TC-ORDER-006 | ⬜ |
| US-A01 | TC-AUTH-001~003, TC-JWT-001~002 | ⬜ |
| US-A02 | TC-ORDER-003~004, TC-SSE-001~002 | ⬜ |
| US-A03 | TC-ORDER-005, TC-TABLE-001~004 | ⬜ |
| US-A04 | TC-MENU-002~005 | ⬜ |
