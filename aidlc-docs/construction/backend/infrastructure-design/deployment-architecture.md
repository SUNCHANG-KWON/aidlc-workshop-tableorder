# Deployment Architecture - Backend

## 아키텍처 다이어그램

```
+---------------------------------------------------+
|                Docker Compose Host                 |
|                                                    |
|  +-----------+       +----------+                  |
|  |  backend  | ----> |    db    |                  |
|  | :8080     |       | :5432   |                  |
|  | Spring    |       | Postgres |                  |
|  | Boot      |       |          |                  |
|  +-----------+       +----------+                  |
|       ^                   |                        |
|       |              [pgdata vol]                  |
+-------|--------------------------------------------+
        |
   localhost:8080
        |
  +-----+------+
  |  Frontend   |
  |  (Unit 2)   |
  +-------------+
```

## 배포 절차
1. `docker compose build` - 이미지 빌드
2. `docker compose up -d` - 서비스 시작
3. Flyway 자동 실행 - DB 스키마 마이그레이션
4. Health check 확인

## 개발 환경
- 로컬 개발: `./gradlew bootRun` (H2 또는 로컬 PostgreSQL)
- 통합 테스트: Docker Compose로 전체 스택 실행
