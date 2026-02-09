# Components

## Backend Components (Spring Boot)

### 1. AuthController
- **목적**: 인증 관련 HTTP 엔드포인트
- **책임**: 관리자 로그인, 테이블 태블릿 로그인, 토큰 갱신
- **인터페이스**: REST API (`/api/auth/*`)

### 2. MenuController
- **목적**: 메뉴 관련 HTTP 엔드포인트
- **책임**: 메뉴 CRUD, 카테고리별 조회, 순서 조정
- **인터페이스**: REST API (`/api/menus/*`, `/api/categories/*`)

### 3. OrderController
- **목적**: 주문 관련 HTTP 엔드포인트
- **책임**: 주문 생성, 조회, 상태 변경, 삭제
- **인터페이스**: REST API (`/api/orders/*`)

### 4. TableController
- **목적**: 테이블 관리 HTTP 엔드포인트
- **책임**: 테이블 등록, 세션 관리, 이용 완료 처리
- **인터페이스**: REST API (`/api/tables/*`)

### 5. SseController
- **목적**: SSE 실시간 이벤트 스트림 엔드포인트
- **책임**: 관리자/고객 SSE 연결 관리, 이벤트 발행
- **인터페이스**: SSE (`/api/sse/*`)

### 6. AuthService
- **목적**: 인증 비즈니스 로직
- **책임**: 로그인 검증, JWT 생성/검증, 로그인 시도 제한

### 7. MenuService
- **목적**: 메뉴 비즈니스 로직
- **책임**: 메뉴 CRUD 처리, 검증, 순서 관리

### 8. OrderService
- **목적**: 주문 비즈니스 로직
- **책임**: 주문 생성, 상태 전이, 삭제, 세션별 조회

### 9. TableService
- **목적**: 테이블/세션 비즈니스 로직
- **책임**: 테이블 등록, 세션 시작/종료, 이용 완료 처리, 주문 이력 이동

### 10. SseService
- **목적**: SSE 이벤트 관리
- **책임**: SSE emitter 관리, 이벤트 브로드캐스트

### 11. JwtTokenProvider
- **목적**: JWT 토큰 유틸리티
- **책임**: 토큰 생성, 파싱, 검증

### 12. JwtAuthenticationFilter
- **목적**: 인증 필터
- **책임**: 요청별 JWT 검증, SecurityContext 설정

## Frontend Components (React)

### 13. CustomerApp
- **목적**: 고객용 SPA 루트
- **책임**: 라우팅 (메뉴/장바구니/주문내역), 자동 로그인, SSE 연결

### 14. AdminApp
- **목적**: 관리자용 SPA 루트
- **책임**: 라우팅 (대시보드/메뉴관리), 로그인, SSE 연결

## Data Layer

### 15. Repository Layer
- **목적**: 데이터 접근
- **책임**: StoreRepository, TableRepository, MenuRepository, CategoryRepository, OrderRepository, OrderItemRepository, OrderHistoryRepository
