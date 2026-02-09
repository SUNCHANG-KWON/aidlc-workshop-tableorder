# Unit of Work Plan

## 개요
모놀리식 아키텍처(Spring Boot + React)에서의 작업 단위 분해 계획

---

## Part A: 질문

### Question 1
Backend(Spring Boot)와 Frontend(React)를 어떤 단위로 나누어 개발하시겠습니까?

A) 단일 Unit - Backend + Frontend를 하나의 작업 단위로 (순차 개발)
B) 2개 Unit - Backend와 Frontend를 별도 작업 단위로 분리 (Backend 먼저 → Frontend)
C) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Part B: 실행 체크리스트

- [x] Step 1: Unit 정의 및 책임 범위 작성 (unit-of-work.md)
- [x] Step 2: Unit 간 의존성 매트릭스 작성 (unit-of-work-dependency.md)
- [x] Step 3: User Story → Unit 매핑 작성 (unit-of-work-story-map.md)
- [x] Step 4: 코드 조직 전략 문서화 (Greenfield)
- [x] Step 5: 검증 (모든 스토리 할당 확인, 의존성 일관성)
