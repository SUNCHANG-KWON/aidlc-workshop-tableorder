# Unit of Work

## 분해 전략
2개 Unit으로 분리: Backend 먼저 완성 → Frontend 개발

---

## Unit 1: Backend (Spring Boot)

**이름**: table-order-backend
**유형**: Module (모놀리식 내 백엔드)
**기술 스택**: Java 17+, Spring Boot 3.x, Spring Security, Spring Data JPA, PostgreSQL

**책임 범위**:
- REST API 전체 (Auth, Menu, Order, Table)
- SSE 실시간 이벤트 스트림
- JWT 인증/인가
- 비즈니스 로직 (주문 처리, 세션 관리, 메뉴 관리)
- 데이터 모델 및 DB 스키마
- 데이터 검증

**포함 컴포넌트**:
- AuthController, AuthService
- MenuController, MenuService
- OrderController, OrderService
- TableController, TableService
- SseController, SseService
- JwtTokenProvider, JwtAuthenticationFilter
- Repository Layer (전체)
- Entity/DTO 클래스

**코드 조직 (Greenfield)**:
```
backend/
  src/main/java/com/tableorder/
    config/          # Security, CORS, SSE 설정
    controller/      # REST Controllers
    service/         # Business Logic
    repository/      # Data Access
    entity/          # JPA Entities
    dto/             # Request/Response DTOs
    security/        # JWT, Filter
    exception/       # 예외 처리
  src/main/resources/
    application.yml
    db/migration/    # DB 스키마
  src/test/
  build.gradle (또는 pom.xml)
  Dockerfile
```

---

## Unit 2: Frontend (React)

**이름**: table-order-frontend
**유형**: Module (모놀리식 내 프론트엔드)
**기술 스택**: React 18+, TypeScript, Vite

**책임 범위**:
- 고객용 UI (메뉴 조회, 장바구니, 주문, 주문 내역)
- 관리자용 UI (로그인, 대시보드, 테이블 관리, 메뉴 관리)
- 클라이언트 상태 관리 (장바구니 로컬 저장)
- SSE 클라이언트 연결
- JWT 토큰 관리 (저장, 자동 갱신)
- API 호출 (Backend REST API 연동)

**포함 컴포넌트**:
- CustomerApp (메뉴, 장바구니, 주문, 주문내역 페이지)
- AdminApp (로그인, 대시보드, 메뉴관리 페이지)
- API 클라이언트 모듈
- SSE 클라이언트 모듈
- 인증 모듈 (토큰 저장/자동 로그인)

**코드 조직 (Greenfield)**:
```
frontend/
  src/
    api/             # API 클라이언트
    components/      # 공통 UI 컴포넌트
    pages/
      customer/      # 고객용 페이지
      admin/         # 관리자용 페이지
    hooks/           # Custom Hooks (SSE, Auth 등)
    store/           # 상태 관리 (장바구니 등)
    types/           # TypeScript 타입 정의
    utils/           # 유틸리티
  public/
  index.html
  package.json
  vite.config.ts
  Dockerfile
```

---

## 개발 순서
1. **Unit 1 (Backend)** 먼저 완성 → API 테스트 가능 상태
2. **Unit 2 (Frontend)** Backend API 기반으로 개발

## Docker Compose 통합
```
docker-compose.yml
  - backend (Spring Boot, port 8080)
  - frontend (React/Nginx, port 3000)
  - db (PostgreSQL, port 5432)
```
