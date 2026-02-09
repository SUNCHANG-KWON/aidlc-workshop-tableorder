# Unit of Work Plan

## Checklist
- [x] 요구사항/스토리 기준 unit 수 결정
- [x] unit 경계와 module 책임 정의
- [x] story-to-unit 매핑
- [x] dependency 검증
- [x] 코드 디렉터리 전략 확정

## Decomposition Decision
- Unit Count: 1
- Unit Name: `table-order-monolith`
- Rationale: MVP 범위는 단일 배포 단위로 구현 가능하며, customer/admin/shared module 분리로 복잡도 제어 가능

## Questions
- 자동 진행 정책으로 질문 단계 생략
