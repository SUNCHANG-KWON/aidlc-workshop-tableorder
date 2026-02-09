# Business Logic Model - Backend

## 핵심 비즈니스 흐름

### Flow 1: 주문 생성
```
1. 요청 수신 (tableId, items[{menuId, quantity}])
2. 테이블 존재 확인
3. 각 menuId 존재 확인 → 메뉴명/단가 스냅샷 취득
4. 세션 자동 시작 (BR-03-2): currentSessionId가 null이면 UUID 생성
5. Order 생성 (status=PENDING, sessionId=currentSessionId)
6. OrderItem 생성 (스냅샷 데이터)
7. totalAmount 계산
8. DB 저장 (단일 트랜잭션)
9. SSE 이벤트: NEW_ORDER → 관리자
10. 응답: OrderResponse (주문번호, 상태, 금액)
```

### Flow 2: 주문 상태 변경
```
1. 요청 수신 (orderId, newStatus)
2. Order 조회
3. 상태 전이 검증 (BR-03-3)
4. 상태 업데이트
5. DB 저장
6. SSE 이벤트: ORDER_STATUS_CHANGED → 관리자 + 해당 테이블
7. 응답: OrderResponse
```

### Flow 3: 주문 삭제
```
1. 요청 수신 (orderId)
2. Order 조회 → tableId 확인
3. Order + OrderItems 삭제
4. SSE 이벤트: ORDER_DELETED → 관리자 + 해당 테이블
5. 응답: 성공
```

### Flow 4: 이용 완료
```
1. 요청 수신 (tableId)
2. 테이블 조회 → currentSessionId 확인
3. 활성 주문 전체 조회 (sessionId 기준)
4. 각 주문 → OrderHistory 변환 (orderData=JSON, completedAt=now)
5. OrderHistory 일괄 저장
6. 활성 주문 + OrderItems 일괄 삭제
7. 테이블 리셋 (currentSessionId=null, sessionStartedAt=null)
8. 전체 단일 트랜잭션
9. SSE 이벤트: TABLE_COMPLETED → 관리자 + 해당 테이블
10. 응답: 성공
```

### Flow 5: 관리자 로그인
```
1. 요청 수신 (storeIdentifier, username, password)
2. Store 조회 (storeIdentifier)
3. Admin 조회 (storeId + username)
4. 잠금 확인 (BR-01-2)
5. 비밀번호 bcrypt 검증
6. 실패 시: loginAttempts++, 5회 시 lockedUntil 설정
7. 성공 시: loginAttempts=0, JWT 발급 (16시간, role=ADMIN)
8. 응답: TokenResponse
```

### Flow 6: 테이블 로그인
```
1. 요청 수신 (storeIdentifier, tableNumber, password)
2. Store 조회 (storeIdentifier)
3. StoreTable 조회 (storeId + tableNumber)
4. 비밀번호 bcrypt 검증
5. 성공 시: JWT 발급 (16시간, role=TABLE, subject=tableId)
6. 응답: TokenResponse
```
