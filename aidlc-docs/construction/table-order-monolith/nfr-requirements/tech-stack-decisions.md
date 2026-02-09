# Tech Stack Decisions

## Runtime
- Node.js 24 (built-in modules only)

## Server
- `http` module 기반 REST + SSE

## Storage
- JSON file persistence (`data/db.json`)

## Auth
- JWT(HMAC-SHA256) custom implementation
- password hash: `crypto.scrypt` + random salt

## Frontend
- 정적 HTML/CSS/Vanilla JS
- localStorage for customer cart/autologin config

## Testing
- `node:test` + built-in `fetch`

## Trade-off
- 장점: 외부 dependency 없이 실행 가능
- 한계: production-grade DB/ORM/bcrypt 미사용
