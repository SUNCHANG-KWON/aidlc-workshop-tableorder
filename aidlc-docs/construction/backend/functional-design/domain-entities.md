# Domain Entities - Backend

## Entity Relationship

```
Store (1) ──── (N) Table
Store (1) ──── (N) Admin
Store (1) ──── (N) Category ──── (N) Menu
Table (1) ──── (N) Order ──── (N) OrderItem ──── Menu
Table (1) ──── (N) OrderHistory
```

---

## Entities

### Store
| 속성 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | Long | PK, Auto | 매장 고유 ID |
| storeIdentifier | String | Unique, Not Null | 매장 식별자 (로그인용) |
| name | String | Not Null | 매장명 |
| createdAt | LocalDateTime | Not Null | 생성 시각 |

### Admin
| 속성 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | Long | PK, Auto | 관리자 고유 ID |
| storeId | Long | FK(Store), Not Null | 소속 매장 |
| username | String | Not Null | 사용자명 |
| passwordHash | String | Not Null | bcrypt 해시 비밀번호 |
| loginAttempts | Integer | Default 0 | 로그인 실패 횟수 |
| lockedUntil | LocalDateTime | Nullable | 잠금 해제 시각 |

### StoreTable
| 속성 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | Long | PK, Auto | 테이블 고유 ID |
| storeId | Long | FK(Store), Not Null | 소속 매장 |
| tableNumber | Integer | Not Null | 테이블 번호 |
| passwordHash | String | Not Null | bcrypt 해시 비밀번호 |
| currentSessionId | String | Nullable | 현재 활성 세션 ID (UUID) |
| sessionStartedAt | LocalDateTime | Nullable | 세션 시작 시각 |

> 엔티티명 `StoreTable`: `Table`은 SQL 예약어이므로 회피

### Category
| 속성 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | Long | PK, Auto | 카테고리 고유 ID |
| storeId | Long | FK(Store), Not Null | 소속 매장 |
| name | String | Not Null | 카테고리명 |
| displayOrder | Integer | Not Null, Default 0 | 노출 순서 |

### Menu
| 속성 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | Long | PK, Auto | 메뉴 고유 ID |
| categoryId | Long | FK(Category), Not Null | 소속 카테고리 |
| name | String | Not Null | 메뉴명 |
| price | Integer | Not Null, Min 0 | 가격 (원) |
| description | String | Nullable | 메뉴 설명 |
| imageUrl | String | Nullable | 이미지 URL |
| displayOrder | Integer | Not Null, Default 0 | 노출 순서 |
| createdAt | LocalDateTime | Not Null | 생성 시각 |

### Order
| 속성 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | Long | PK, Auto | 주문 고유 ID |
| tableId | Long | FK(StoreTable), Not Null | 테이블 |
| sessionId | String | Not Null | 테이블 세션 ID |
| totalAmount | Integer | Not Null | 총 주문 금액 |
| status | OrderStatus | Not Null, Default PENDING | 주문 상태 |
| createdAt | LocalDateTime | Not Null | 주문 시각 |

### OrderItem
| 속성 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | Long | PK, Auto | 항목 고유 ID |
| orderId | Long | FK(Order), Not Null | 소속 주문 |
| menuId | Long | FK(Menu), Not Null | 메뉴 |
| menuName | String | Not Null | 주문 시점 메뉴명 (스냅샷) |
| quantity | Integer | Not Null, Min 1 | 수량 |
| unitPrice | Integer | Not Null | 주문 시점 단가 (스냅샷) |

### OrderHistory
| 속성 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | Long | PK, Auto | 이력 고유 ID |
| tableId | Long | FK(StoreTable), Not Null | 테이블 |
| sessionId | String | Not Null | 세션 ID |
| orderData | JSON/Text | Not Null | 주문 상세 (JSON 직렬화) |
| totalAmount | Integer | Not Null | 총 금액 |
| orderedAt | LocalDateTime | Not Null | 원래 주문 시각 |
| completedAt | LocalDateTime | Not Null | 이용 완료 시각 |

---

## Enums

### OrderStatus
| 값 | 설명 |
|----|------|
| PENDING | 대기중 |
| PREPARING | 준비중 |
| COMPLETED | 완료 |
