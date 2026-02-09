# Performance Test Instructions

## Scope
MVP 단계에서는 정식 load test 도구를 추가하지 않고 smoke 성능 확인만 수행한다.

## Simple Smoke Test
1. 서버 실행
2. 주문 생성 API를 반복 호출해 응답 시간 관찰

```bash
node src/index.js
# 다른 터미널에서 curl 또는 브라우저로 반복 호출
```

## Target
- SSE 이벤트 반영: 2초 이내
- 단일 인스턴스 기준 기본 주문 처리 지연: 사용자 체감상 즉시

## Next
실운영 전에는 `k6` 또는 `autocannon` 기반 스크립트를 추가한다.
