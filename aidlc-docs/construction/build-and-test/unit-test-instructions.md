# Unit Test Execution

## Run Unit/Service Tests

```bash
npm test
```

## Expected Result
- `tests/jwt.test.js` pass
- `tests/password.test.js` pass
- `tests/api.test.js` pass

## Notes
- sandbox 환경에서 TCP listen이 제한될 수 있어 integration은 network bind 없이 service-level 흐름 검증으로 작성됨
