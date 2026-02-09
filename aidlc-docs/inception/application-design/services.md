# Services

## 서비스 레이어 설계

### AuthService
- **역할**: 인증 오케스트레이션
- **의존**: StoreRepository, JwtTokenProvider
- **오케스트레이션**: 자격 증명 검증 → 로그인 시도 제한 확인 → JWT 발급

### MenuService
- **역할**: 메뉴 관리 오케스트레이션
- **의존**: MenuRepository, CategoryRepository
- **오케스트레이션**: 입력 검증 → CRUD 수행 → 결과 반환

### OrderService
- **역할**: 주문 처리 오케스트레이션
- **의존**: OrderRepository, OrderItemRepository, TableService, SseService
- **오케스트레이션**:
  - 주문 생성: 주문 저장 → 세션 자동 시작 (첫 주문 시) → SSE 이벤트 발행
  - 상태 변경: 상태 전이 검증 → 업데이트 → SSE 이벤트 발행
  - 주문 삭제: 삭제 → 총액 재계산 → SSE 이벤트 발행

### TableService
- **역할**: 테이블/세션 관리 오케스트레이션
- **의존**: TableRepository, OrderRepository, OrderHistoryRepository
- **오케스트레이션**:
  - 이용 완료: 활성 주문 → OrderHistory 이동 → 테이블 리셋 → SSE 이벤트 발행

### SseService
- **역할**: 실시간 이벤트 브로드캐스트
- **의존**: 없음 (다른 서비스에서 호출됨)
- **오케스트레이션**: emitter 관리 → 이벤트 타입별 대상 선택 → 전송

## 트랜잭션 경계

| 작업 | 트랜잭션 범위 |
|------|-------------|
| 주문 생성 | Order + OrderItems 단일 트랜잭션 |
| 이용 완료 | Orders → OrderHistory 이동 + 테이블 리셋 단일 트랜잭션 |
| 주문 삭제 | Order 삭제 + 총액 재계산 단일 트랜잭션 |
