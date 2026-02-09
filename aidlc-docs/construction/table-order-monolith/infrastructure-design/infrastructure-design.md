# Infrastructure Design

## Target Environment
- 단일 Node 프로세스 배포 (MVP)

## Compute
- Node runtime 1 instance (scale-out은 향후)

## Storage
- 로컬 파일 시스템: `data/db.json`

## Network
- HTTP port 기반 API + static file serving
- SSE endpoint: `/api/admin/orders/stream`

## Security
- secret key env var (`APP_JWT_SECRET`)
- 관리자 credential seed는 초기 데이터로 제공

## Monitoring
- stdout structured log
- 향후 cloud logging 연동 여지 유지
