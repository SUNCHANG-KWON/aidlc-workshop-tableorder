# Integration Test Instructions

## Purpose
service 간 상호작용(auth -> menu -> order -> dashboard -> session complete -> history)을 검증한다.

## Scenario
1. table login
2. menu 조회
3. order 생성
4. admin login
5. dashboard 조회
6. order status 변경
7. order 삭제
8. 신규 order 생성
9. session complete
10. history 조회

## Execution
```bash
node --test tests/api.test.js
```

## Expected
- `service integration workflow` 테스트 pass
- `SSE hub publishes messages to subscribers` 테스트 pass
