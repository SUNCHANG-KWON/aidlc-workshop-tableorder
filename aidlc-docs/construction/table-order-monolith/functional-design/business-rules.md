# Business Rules

1. 주문 생성은 table token(role=table) 필요
2. 주문 item은 현재 store의 active menu여야 함
3. 주문 totalAmount는 서버에서 재계산
4. order status 허용값: `대기중`, `준비중`, `완료`
5. admin만 status 변경/주문삭제/session완료 가능
6. session complete 시 active orders 전부 history로 이동
7. customer 주문내역 조회는 token의 `sessionId`로 필터
8. admin session 만료시간은 16시간
9. login attempt 제한 초과 시 일시 차단
10. 메뉴 price는 0보다 커야 함
11. 제외 기능(결제/알림/외부연동)은 API에서 제공하지 않음
