# NFR Design Patterns - Backend

## 1. 인증/인가 패턴

**패턴**: JWT Filter Chain
- JwtAuthenticationFilter → SecurityContext 설정
- 엔드포인트별 권한: ADMIN (관리자 API), TABLE (고객 API), permitAll (로그인 API)
- 토큰 만료 시 401 응답 → 클라이언트 재로그인

## 2. 에러 처리 패턴

**패턴**: Global Exception Handler (@RestControllerAdvice)
- 일관된 에러 응답 포맷: `{error, message, status, timestamp}`
- 비즈니스 예외: 400 (검증 실패), 404 (리소스 없음), 409 (상태 충돌)
- 인증 예외: 401 (미인증), 403 (권한 없음)
- 서버 예외: 500 (내부 오류)

## 3. SSE 패턴

**패턴**: Emitter Registry
- ConcurrentHashMap으로 emitter 관리
- 관리자 emitter: 단일 목록
- 테이블 emitter: tableId별 관리
- timeout 30분, 연결 끊김 시 자동 제거
- 전송 실패 시 해당 emitter 제거 (dead connection 정리)

## 4. 트랜잭션 패턴

**패턴**: Service Layer Transaction (@Transactional)
- 주문 생성: Order + OrderItems 단일 트랜잭션
- 이용 완료: 이력 이동 + 삭제 + 리셋 단일 트랜잭션
- 읽기 전용: @Transactional(readOnly = true)

## 5. 데이터 접근 패턴

**패턴**: Repository Pattern (Spring Data JPA)
- 엔티티별 Repository 인터페이스
- 커스텀 쿼리: @Query 또는 메서드 네이밍 규칙
- 페이지네이션: Pageable 파라미터
