# Deployment Architecture

## Runtime Shape
1. Browser (Customer/Admin)
2. Node HTTP Server
3. JSON Data Store

## Data Flow
- Customer/Admin -> REST API
- Admin Dashboard <- SSE stream
- Services <-> Data Store

## Future Upgrade Path
- DB 교체: JSON -> PostgreSQL
- Auth 강화: scrypt -> bcrypt/Argon2
- Multi-instance: shared DB + pub/sub for SSE
