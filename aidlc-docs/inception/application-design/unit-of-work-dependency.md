# Unit of Work Dependencies

## 의존성 매트릭스

| Unit | 의존 대상 | 의존 유형 | 설명 |
|------|----------|----------|------|
| Unit 1 (Backend) | PostgreSQL | Runtime | DB 연결 |
| Unit 2 (Frontend) | Unit 1 (Backend) | Runtime | REST API + SSE 호출 |

## 의존성 방향

```
PostgreSQL ← Unit 1 (Backend) ← Unit 2 (Frontend)
```

- Frontend → Backend: REST API 호출 (HTTP), SSE 연결
- Backend → PostgreSQL: JPA/JDBC 연결

## 개발 순서 제약
- Unit 1 (Backend)은 독립적으로 개발/테스트 가능
- Unit 2 (Frontend)는 Unit 1의 API가 완성되어야 연동 가능
- 단, Frontend는 Mock API로 병렬 개발 가능 (선택사항)

## 통합 포인트
- REST API 계약: JSON Request/Response 스키마
- SSE 이벤트 계약: 이벤트 타입 및 데이터 포맷
- 인증 계약: JWT 토큰 형식 및 헤더 규약
