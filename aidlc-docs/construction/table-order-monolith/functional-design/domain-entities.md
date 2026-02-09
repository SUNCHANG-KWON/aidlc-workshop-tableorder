# Domain Entities

## Store
- `storeId`, `name`
- `adminUsers[]`
- `tables[]`
- `menus[]`

## AdminUser
- `id`, `username`, `passwordHash`, `passwordSalt`

## Table
- `tableNumber`, `tablePassword`, `activeSessionId`, `sessionStartedAt`

## Menu
- `menuId`, `name`, `price`, `description`, `category`, `imageUrl`, `displayOrder`, `isActive`

## Order
- `orderId`, `orderNumber`, `storeId`, `tableNumber`, `sessionId`, `status`, `items[]`, `totalAmount`, `createdAt`

## OrderItem
- `menuId`, `menuName`, `quantity`, `unitPrice`, `lineTotal`

## OrderHistory
- `historyId`, `storeId`, `tableNumber`, `sessionId`, `orders[]`, `completedAt`

## Token Claims
- Admin: `sub`, `role=admin`, `storeId`, `exp`
- Table: `sub`, `role=table`, `storeId`, `tableNumber`, `sessionId`, `exp`
