# Security Test Instructions

## Checklist
1. Authorization header 없는 admin API 요청 시 401
2. table token으로 admin API 요청 시 403
3. 잘못된 비밀번호 5회 후 로그인 제한(429)
4. 잘못된 JWT 서명 시 401
5. 메뉴 가격 음수 입력 시 400

## Manual Execution
```bash
npm test
```
`tests/jwt.test.js`, `tests/api.test.js`에서 핵심 검증 일부를 자동 수행한다.
