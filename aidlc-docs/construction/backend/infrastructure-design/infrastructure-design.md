# Infrastructure Design - Backend

## 배포 환경: Docker Compose (로컬/온프레미스)

### 서비스 구성

| 서비스 | 이미지 | 포트 | 역할 |
|--------|--------|------|------|
| backend | 커스텀 (Dockerfile) | 8080 | Spring Boot API 서버 |
| db | postgres:15-alpine | 5432 | PostgreSQL 데이터베이스 |

### 네트워크
- 단일 Docker 네트워크 (bridge)
- backend → db: 내부 네트워크 통신 (db:5432)
- 외부 → backend: localhost:8080

### 볼륨
- `pgdata`: PostgreSQL 데이터 영속화 (/var/lib/postgresql/data)

### 환경 변수

**backend:**
| 변수 | 설명 |
|------|------|
| SPRING_DATASOURCE_URL | jdbc:postgresql://db:5432/tableorder |
| SPRING_DATASOURCE_USERNAME | tableorder |
| SPRING_DATASOURCE_PASSWORD | 환경별 설정 |
| JWT_SECRET | JWT 서명 키 |

**db:**
| 변수 | 설명 |
|------|------|
| POSTGRES_DB | tableorder |
| POSTGRES_USER | tableorder |
| POSTGRES_PASSWORD | 환경별 설정 |

### Dockerfile (Backend)
```
Multi-stage build:
  Stage 1: Gradle build (gradle:8-jdk17)
  Stage 2: Runtime (eclipse-temurin:17-jre-alpine)
```

### Health Check
- backend: Spring Boot Actuator `/actuator/health`
- db: `pg_isready`

### Restart Policy
- 모든 서비스: `restart: always`
