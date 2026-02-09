# NFR Requirements

## Security
- 토큰 서명 기반 인증/인가
- 관리자 로그인 시도 횟수 제한
- 비밀번호 평문 저장 금지(해시+salt)
- 입력 validation 및 role별 endpoint 권한 분리

## Performance
- SSE 이벤트 전파 지연 목표: 2초 이내
- dashboard 조회는 table aggregation O(n) 내 처리

## Availability/Reliability
- 파일 기반 저장 실패 시 5xx 반환 및 기존 데이터 보존
- 주문 생성 실패 시 client cart 유지

## Usability
- customer UI 터치 target 최소 44x44
- 메뉴 카드 중심 UI + category 빠른 이동

## Testability/Maintainability
- 순수 function(unit test) + API integration test
- service/module 분리
