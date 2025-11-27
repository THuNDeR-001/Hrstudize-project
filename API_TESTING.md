# API Testing Guide

This document provides example curl commands for testing all API endpoints.

## Base URL
```
http://localhost:3000/api/auth
```

## 1. Register New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "Password123!",
    "phone": "+11234567899"
  }'
```

Expected Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "demo@example.com",
    "phone": "+11234567899"
  }
}
```

## 2. Login (Without 2FA)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "Password123!"
  }'
```

Save the `accessToken` and `refreshToken` from the response.

## 3. Get User Profile (Protected Route)

```bash
# Replace <ACCESS_TOKEN> with your actual token
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

## 4. Enable 2FA

```bash
curl -X POST http://localhost:3000/api/auth/2fa/enable \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Check console or `logs/otp.log` for the OTP code.

## 5. Verify 2FA Setup

```bash
# Replace <USER_ID> and <OTP_CODE>
curl -X POST "http://localhost:3000/api/auth/2fa/verify?userId=<USER_ID>&purpose=enable_2fa" \
  -H "Content-Type: application/json" \
  -d '{
    "otp": "<OTP_CODE>"
  }'
```

## 6. Login with 2FA

After enabling 2FA, login requires two steps:

### Step 1: Initial Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "Password123!"
  }'
```

Response will include `requires2FA: true` and `userId`.

### Step 2: Verify OTP
Check logs for OTP, then:
```bash
curl -X POST "http://localhost:3000/api/auth/2fa/verify?userId=<USER_ID>&purpose=login_2fa" \
  -H "Content-Type: application/json" \
  -d '{
    "otp": "<OTP_CODE>"
  }'
```

## 7. Refresh Access Token

```bash
curl -X POST http://localhost:3000/api/auth/token/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<REFRESH_TOKEN>"
  }'
```

## 8. Forgot Password

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com"
  }'
```

Check console or logs for the reset token.

## 9. Reset Password

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "<RESET_TOKEN_FROM_LOGS>",
    "newPassword": "NewPassword123!"
  }'
```

## 10. Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<REFRESH_TOKEN>"
  }'
```

## Health Check

```bash
curl -X GET http://localhost:3000/health
```

## Test Users

Pre-seeded users (if you ran `npm run seed`):
- Email: `testuser@example.com`, Password: `Password123!`
- Email: `admin@example.com`, Password: `Password123!`

## Viewing OTPs and Reset Tokens

### OTPs (Mock SMS)
- **Console:** Check terminal output
- **Log file:** `logs/otp.log`

### Password Reset Tokens
- **Console:** Check terminal output
- **Log file:** `logs/combined.log`

## Error Examples

### Invalid Email Format
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "Password123!",
    "phone": "+11234567899"
  }'
```

### Weak Password
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "weak",
    "phone": "+11234567899"
  }'
```

### Invalid Phone Format
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "phone": "1234567890"
  }'
```

### Unauthorized Access
```bash
curl -X GET http://localhost:3000/api/auth/profile
# No Authorization header - should return 401
```

### Invalid Token
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer invalid-token"
# Should return 401
```
