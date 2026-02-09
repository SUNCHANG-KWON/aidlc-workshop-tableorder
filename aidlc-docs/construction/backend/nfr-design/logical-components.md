# Logical Components - Backend

## 컴포넌트 매핑

| Logical Component | 구현 기술 | 역할 |
|-------------------|----------|------|
| Web Server | Spring Boot Embedded Tomcat | HTTP 요청 처리 |
| REST API | Spring MVC @RestController | API 엔드포인트 |
| SSE Server | Spring MVC SseEmitter | 실시간 이벤트 스트림 |
| Auth Filter | Spring Security FilterChain | JWT 인증 필터 |
| ORM | Hibernate (JPA) | 엔티티-DB 매핑 |
| Connection Pool | HikariCP (Spring Boot 기본) | DB 커넥션 풀 |
| DB Migration | Flyway | 스키마 버전 관리 |
| Password Encoder | BCryptPasswordEncoder | 비밀번호 해싱 |
| JWT Provider | jjwt 라이브러리 | 토큰 생성/검증 |
| Exception Handler | @RestControllerAdvice | 글로벌 에러 처리 |
| Logger | SLF4J + Logback | 로깅 |

## 설정 항목 (application.yml)

| 설정 | 값 | 설명 |
|------|-----|------|
| server.port | 8080 | 서버 포트 |
| spring.datasource.url | jdbc:postgresql://db:5432/tableorder | DB 연결 |
| spring.jpa.hibernate.ddl-auto | validate | Flyway로 스키마 관리 |
| jwt.secret | 환경변수 | JWT 서명 키 |
| jwt.expiration | 57600000 (16시간 ms) | 토큰 만료 |
| cors.allowed-origins | http://localhost:3000 | CORS 허용 |
