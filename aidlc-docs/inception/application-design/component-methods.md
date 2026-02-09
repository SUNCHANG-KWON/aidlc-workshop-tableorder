# Component Methods

## AuthComponent
- `loginAdmin(storeId, username, password)` -> `{token, expiresAt}`
- `loginTable(storeId, tableNumber, tablePassword)` -> `{token, sessionId, expiresAt}`
- `verifyToken(token, role)` -> `claims`

## MenuComponent
- `listMenus(storeId, category?)` -> `Menu[]`
- `createMenu(storeId, payload)` -> `Menu`
- `updateMenu(storeId, menuId, payload)` -> `Menu`
- `deleteMenu(storeId, menuId)` -> `void`

## OrderComponent
- `createOrder(context, items)` -> `Order`
- `listCurrentSessionOrders(context, page, pageSize)` -> `{items, total}`
- `listDashboardOrders(storeId)` -> `DashboardTableCard[]`
- `updateOrderStatus(storeId, orderId, status)` -> `Order`
- `deleteOrder(storeId, orderId)` -> `void`

## TableSessionComponent
- `completeSession(storeId, tableNumber)` -> `{movedOrders, completedAt}`
- `listHistory(storeId, tableNumber, date?)` -> `OrderHistory[]`

## SseComponent
- `subscribe(storeId, res)` -> `unsubscribeFn`
- `broadcast(storeId, event, data)` -> `void`
