# Requirements Verification Questions

요구사항 문서를 분석한 결과, 아래 항목들에 대한 명확화가 필요합니다.
각 질문의 `[Answer]:` 태그 뒤에 선택지 알파벳을 입력해주세요.

---

## Question 1
백엔드 기술 스택으로 어떤 것을 사용하시겠습니까?

A) Java + Spring Boot
B) Node.js + Express/NestJS
C) Python + FastAPI/Django
D) Go
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
프론트엔드 기술 스택으로 어떤 것을 사용하시겠습니까?

A) React (JavaScript/TypeScript)
B) Vue.js
C) Next.js (React 기반 풀스택)
D) Angular
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
데이터베이스로 어떤 것을 사용하시겠습니까?

A) PostgreSQL
B) MySQL
C) Amazon DynamoDB
D) MongoDB
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
배포 환경은 어디를 대상으로 하시겠습니까?

A) AWS 클라우드 (ECS, Lambda 등)
B) 로컬/온프레미스 서버 (Docker Compose 등)
C) AWS 클라우드 + 로컬 개발 환경 모두 지원
D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 5
매장(Store) 관리 범위는 어떻게 되나요? (멀티테넌시 관련)

A) 단일 매장만 지원 (MVP 단순화)
B) 다중 매장 지원 (각 매장이 독립적으로 운영)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
메뉴 이미지 관리 방식은 어떻게 하시겠습니까?

A) 외부 이미지 URL만 저장 (이미지 업로드 기능 없음)
B) 서버에 직접 이미지 파일 업로드 및 저장
C) AWS S3 등 클라우드 스토리지에 업로드
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
관리자 계정 관리 범위는 어떻게 되나요?

A) 매장당 1개의 관리자 계정 (사전 생성, 회원가입 없음)
B) 매장당 다수의 관리자 계정 (회원가입 기능 포함)
C) 시스템 관리자가 매장 및 관리자 계정을 생성/관리
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 8
고객용 UI의 주문 상태 실시간 업데이트는 어떻게 처리하시겠습니까? (요구사항에 "선택사항"으로 표기됨)

A) MVP에서 제외 (페이지 새로고침으로 확인)
B) MVP에 포함 (SSE 기반 실시간 업데이트)
C) MVP에 포함 (주기적 polling 방식)
D) Other (please describe after [Answer]: tag below)

[Answer]: C
