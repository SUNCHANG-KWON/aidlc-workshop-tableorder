# NFR Design Patterns

## Security Patterns
- Signed JWT + expiration validation
- Role-based authorization middleware
- Login throttle window(실패 count + lockUntil)

## Performance Patterns
- SSE push model로 polling 최소화
- dashboard aggregation result 재활용

## Reliability Patterns
- Atomic write (temp file -> rename)
- Validation-first request handling
- 표준 에러 응답 포맷
