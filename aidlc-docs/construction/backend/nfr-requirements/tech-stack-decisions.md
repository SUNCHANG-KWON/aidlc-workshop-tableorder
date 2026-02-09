# Tech Stack Decisions - Backend

| 영역 | 기술 | 버전 | 선정 근거 |
|------|------|------|----------|
| Language | Java | 17+ | LTS, Spring Boot 3.x 호환 |
| Framework | Spring Boot | 3.x | 생산성, 생태계, SSE 내장 지원 |
| Security | Spring Security | 6.x | JWT 필터, CORS, 인증/인가 |
| ORM | Spring Data JPA + Hibernate | - | 엔티티 매핑, Repository 패턴 |
| Database | PostgreSQL | 15+ | ACID, JSON 지원, 안정성 |
| Migration | Flyway | - | DB 스키마 버전 관리 |
| Build | Gradle (Kotlin DSL) | 8.x | 빌드 속도, 의존성 관리 |
| SSE | Spring MVC SseEmitter | - | 내장 SSE 지원, 별도 라이브러리 불필요 |
| Password | BCryptPasswordEncoder | - | Spring Security 내장 |
| JWT | jjwt (io.jsonwebtoken) | 0.12.x | 경량, 널리 사용 |
| Logging | SLF4J + Logback | - | Spring Boot 기본 |
| Container | Docker | - | 배포 일관성 |
| Orchestration | Docker Compose | - | 로컬/온프레미스 멀티 컨테이너 |
