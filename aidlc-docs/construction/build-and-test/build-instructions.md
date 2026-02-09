# Build Instructions

## Prerequisites
- Build Tool: Node.js 24+
- Dependencies: 외부 package 없음
- Runtime Dependency: `python3` with `bcrypt` module (password hash/verify)
- Environment Variables:
  - `APP_JWT_SECRET` (optional, default exists)
  - `PORT` (optional, default 3000)

## Build Steps

### 1. Install Dependencies
```bash
npm install
```
실제 설치할 dependency가 없어 lockfile만 정리된다.

### 2. Configure Environment
```bash
export APP_JWT_SECRET="replace-with-secure-secret"
export PORT=3000
```

### 3. Build All Units
```bash
# 별도 compile 단계 없음
node -e "import('./src/app.js').then(()=>console.log('syntax-ok'))"
```

### 4. Verify Build Success
- Expected Output: `syntax-ok`
- Build Artifacts: runtime JS files (`src/`, `public/`)
