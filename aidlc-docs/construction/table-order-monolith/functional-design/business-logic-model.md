# Business Logic Model

## Flow 1: Table Auto Login
1. 초기 설정 입력(storeId/tableNumber/tablePassword)
2. 서버 인증 성공 시 table token 발급(16h) + active session 확보
3. client localStorage에 입력값 보관
4. 재접속 시 동일 입력값으로 자동 로그인 호출

## Flow 2: Order Create
1. client cart 검증(빈 cart 방지)
2. server에서 메뉴 유효성/가격 재검증
3. `orderNumber` 생성 후 status=`대기중`
4. active orders에 append
5. SSE로 admin dashboard broadcast

## Flow 3: Admin Dashboard
1. admin token 검증
2. store별 SSE stream 연결
3. 신규 주문/상태변경/삭제/세션완료 이벤트 수신
4. table card(합계 + 최신 n개 주문 preview) 재렌더링

## Flow 4: Session Complete
1. admin이 table session complete 요청
2. 해당 session의 active orders를 history로 이동
3. table activeSessionId reset
4. customer 다음 주문 시 신규 session 생성

## Flow 5: History Lookup
1. admin이 table + optional date로 조회
2. history 목록 시간 역순 반환
