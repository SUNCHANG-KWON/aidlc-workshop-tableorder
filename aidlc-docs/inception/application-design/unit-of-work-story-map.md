# Unit of Work - Story Map

## Unit 1: Backend (table-order-backend)

| User Story | 역할 | 설명 |
|-----------|------|------|
| US-C01 | API 제공 | 테이블 로그인 API, JWT 발급 |
| US-C02 | API 제공 | 카테고리/메뉴 조회 API |
| US-C03 | - | 장바구니는 클라이언트 전용 (Backend 관여 없음) |
| US-C04 | API 제공 | 주문 생성 API, SSE 이벤트 발행 |
| US-C05 | API 제공 | 세션별 주문 조회 API, SSE 주문 상태 이벤트 |
| US-A01 | API 제공 | 관리자 로그인 API, JWT 발급 |
| US-A02 | API 제공 | 주문 조회/상태 변경 API, SSE 이벤트 스트림 |
| US-A03 | API 제공 | 테이블 등록/이용완료/주문삭제/과거내역 API |
| US-A04 | API 제공 | 메뉴 CRUD API, 순서 변경 API |

## Unit 2: Frontend (table-order-frontend)

| User Story | 역할 | 설명 |
|-----------|------|------|
| US-C01 | UI 구현 | 자동 로그인 화면, 로컬 저장, 세션 관리 |
| US-C02 | UI 구현 | 메뉴 카드 레이아웃, 카테고리 탐색 |
| US-C03 | UI 구현 | 장바구니 UI, 로컬 저장, 수량 조절 |
| US-C04 | UI 구현 | 주문 확인/확정 화면, 5초 후 리다이렉트 |
| US-C05 | UI 구현 | 주문 내역 목록, SSE 상태 업데이트, 페이지네이션 |
| US-A01 | UI 구현 | 관리자 로그인 화면, 토큰 저장 |
| US-A02 | UI 구현 | 대시보드 그리드, SSE 연결, 신규 주문 강조 |
| US-A03 | UI 구현 | 테이블 설정/삭제/이용완료/과거내역 UI |
| US-A04 | UI 구현 | 메뉴 관리 CRUD 폼, 순서 조정 UI |

## 커버리지 검증

| Story | Unit 1 (Backend) | Unit 2 (Frontend) |
|-------|:-:|:-:|
| US-C01 | ✅ | ✅ |
| US-C02 | ✅ | ✅ |
| US-C03 | - | ✅ |
| US-C04 | ✅ | ✅ |
| US-C05 | ✅ | ✅ |
| US-A01 | ✅ | ✅ |
| US-A02 | ✅ | ✅ |
| US-A03 | ✅ | ✅ |
| US-A04 | ✅ | ✅ |

모든 User Story가 최소 1개 Unit에 할당됨 ✅
US-C03(장바구니)은 클라이언트 전용이므로 Frontend에만 할당 ✅
