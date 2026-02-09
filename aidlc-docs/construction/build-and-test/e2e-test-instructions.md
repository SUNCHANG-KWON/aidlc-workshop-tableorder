# E2E Test Instructions

## Customer Flow
1. `http://localhost:3000/customer.html` 접속
2. store/table/password 입력 후 로그인
3. 메뉴 선택 -> 장바구니 조정 -> 주문
4. 주문번호 표시/5초 modal 확인
5. 세션 주문 내역 확인

## Admin Flow
1. `http://localhost:3000/admin.html` 접속
2. admin 로그인
3. 대시보드에서 신규 주문 확인
4. 상태 변경/주문 삭제/세션 완료 테스트
5. 과거 내역 조회

## Command
```bash
node src/index.js
```
