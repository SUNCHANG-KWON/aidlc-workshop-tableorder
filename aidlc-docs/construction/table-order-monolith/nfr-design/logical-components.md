# Logical Components

- `TokenEngine`: JWT sign/verify
- `PasswordEngine`: salt 생성 + scrypt verify
- `LoginGuard`: login attempt 제한
- `SseHub`: connection registry + broadcast
- `DataStore`: load/save + id sequence
- `ApiErrorMapper`: 일관된 JSON error response
