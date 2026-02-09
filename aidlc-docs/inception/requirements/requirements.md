# Requirements Document

## Intent Analysis
- User Request: `requirements` 기준으로 `.kiro` rule을 따라 단계별 실행하고 개발 완료
- Request Type: New Project
- Scope Estimate: System-wide (고객 화면 + 관리자 화면 + API + 데이터 저장)
- Complexity Estimate: Complex

## Functional Requirements

### Customer
1. 테이블 태블릿 1회 설정 후 자동 로그인
2. 메뉴 기본 화면, category 탐색, 메뉴 상세 정보 표시
3. cart add/remove/quantity/total 계산 및 local 저장
4. 주문 생성, 성공 시 order number 표시 및 cart clear, 5초 후 메뉴 복귀
5. 주문 실패 시 오류 표시 및 cart 유지
6. 현재 table session의 주문 이력 조회

### Admin
1. storeId + username/password 인증
2. 16시간 session 유지
3. 실시간 주문 모니터링 (SSE)
4. 주문 상태 변경 (대기중/준비중/완료)
5. 주문 삭제(직권 수정) 및 합계 재계산
6. table session 완료 처리 및 현재 세션 데이터 reset
7. table별 과거 주문 이력 조회 및 date filter
8. 메뉴 CRUD 및 category 기반 조회

### System/Data
1. store, table, menu, order, orderHistory 데이터 영속 저장
2. sessionId로 주문 그룹화
3. 완료된 table session 주문은 history로 이동

## Non-Functional Requirements
1. Security
- 관리자 비밀번호 해시 저장
- 인증 토큰 기반 session
- 로그인 시도 제한

2. Performance
- SSE 기반 신규 주문 반영 2초 이내

3. Usability
- customer UI touch-friendly(최소 44x44)
- 카드형 메뉴 레이아웃과 명확한 시각 계층

4. Reliability
- 주문 실패 시 cart 데이터 보존
- 서버 오류 응답 표준화

5. Maintainability
- module 단위 분리
- 테스트 자동화(unit/integration)

## Out of Scope (constraints 반영)
- 결제/PG/환불/영수증
- OAuth/SNS 로그인/2FA
- push/SMS/email 알림
- 주방 재고/POS/배달 플랫폼 연동
- 고급 분석/리포트/예약/리뷰/다국어

## Summary
요구사항은 Greenfield MVP 구현에 충분하며, 고객과 관리자의 핵심 플로우를 포함한다. 구현 시 보안 항목 중 `bcrypt` 명시는 런타임 제약(외부 dependency 미사용 가능성)과 함께 최종 검증에서 재평가한다.
