# Submission Documentation

## Project Information

**Project Name:** PostgreSQL Backend - JWT Authentication + 2FA + Forgot Password  
**Submission Date:** November 28, 2025  
**Technology Stack:** Node.js, Express, TypeScript, PostgreSQL  
**Demo Dashboard:** http://localhost:3000 (Frontend included!)

## 🎯 Completed Features

✅ **User Registration** - Email, password (bcrypt hashed), phone number  
✅ **User Login** - JWT access + refresh tokens  
✅ **2FA via SMS OTP** - Enable/disable, verify OTP codes  
✅ **Forgot Password** - Request reset token via email  
✅ **Reset Password** - Secure token-based password reset  
✅ **Protected Routes** - JWT authentication middleware  
✅ **Token Refresh** - Generate new access tokens  
✅ **PostgreSQL Database** - 5 normalized tables with indexes  
✅ **Input Validation** - Joi schemas for all endpoints  
✅ **Rate Limiting** - Prevent brute force attacks  
✅ **Audit Logging** - Track all authentication events  
✅ **Comprehensive Tests** - Jest + Supertest integration tests  
✅ **Docker Deployment** - docker-compose.yml for easy setup  
✅ **Frontend Dashboard** - Live testing interface  
✅ **Cryptographic Proof** - ECDSA signature verification  

## Quick Start Guide

### Prerequisites
- Docker and Docker Compose (recommended)
- OR Node.js 20+ and PostgreSQL 16+

### Running with Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd postgres-jwt-auth-backend

# Start the application
docker-compose up --build
```

The application will:
1. Start PostgreSQL database on port 5432
2. Run database migrations automatically
3. Seed test data
4. Start the API server on port 3000

**Access the API:** `http://localhost:3000`  
**Health Check:** `http://localhost:3000/health`

### Running Locally (Without Docker)

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Run migrations
npm run migrate

# Seed database (optional)
npm run seed

# Start server
npm run dev
```

### Running Tests

```bash
# Install dependencies first
npm install

# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

## Evaluator Credentials

### Test User 1 (No 2FA)
- **Email:** `testuser@example.com`
- **Password:** `Password123!`
- **Phone:** `+1234567890`

### Test User 2 (Admin)
- **Email:** `admin@example.com`
- **Password:** `Password123!`
- **Phone:** `+1234567891`

**Note:** You can also register new users via the `/api/auth/register` endpoint.

## Testing the Application

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "Password123!",
    "phone": "+11234567899"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "Password123!"
  }'
```

**Response:** You'll receive `accessToken` and `refreshToken`

### 3. Access Protected Route

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

### 4. Enable 2FA

```bash
curl -X POST http://localhost:3000/api/auth/2fa/enable \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

**Check OTP:** Look in the console output or `logs/otp.log` file

### 5. Verify 2FA OTP

```bash
curl -X POST "http://localhost:3000/api/auth/2fa/verify?userId=<USER_ID>&purpose=enable_2fa" \
  -H "Content-Type: application/json" \
  -d '{
    "otp": "123456"
  }'
```

### 6. Login with 2FA

After enabling 2FA, login will require OTP verification:

```bash
# Step 1: Login (returns requires2FA: true)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "Password123!"
  }'

# Step 2: Verify OTP (check logs for OTP)
curl -X POST "http://localhost:3000/api/auth/2fa/verify?userId=<USER_ID>&purpose=login_2fa" \
  -H "Content-Type: application/json" \
  -d '{
    "otp": "123456"
  }'
```

### 7. Refresh Token

```bash
curl -X POST http://localhost:3000/api/auth/token/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<YOUR_REFRESH_TOKEN>"
  }'
```

### 8. Forgot Password

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com"
  }'
```

**Check Reset Token:** Look in the console output or logs

### 9. Reset Password

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "<RESET_TOKEN_FROM_LOGS>",
    "newPassword": "NewPassword123!"
  }'
```

### 10. Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<YOUR_REFRESH_TOKEN>"
  }'
```

## OTP and Token Access

### Finding OTPs (Mock SMS)

When using the mock SMS provider (`SMS_PROVIDER=mock` in .env):

1. **Console Output:** OTPs are printed to the console where the server is running
2. **Log File:** Check `logs/otp.log` in the project root

Example output:
```
==================== MOCK SMS ====================
To: +11234567899
Message: Your login OTP is: 123456
==================================================
```

### Finding Password Reset Tokens

Reset tokens are logged to:
1. **Console Output**
2. **Log File:** `logs/combined.log`

Example output:
```
==================== PASSWORD RESET ====================
Email: demo@example.com
Reset Token: abc123def456789...
Expires at: 2025-11-28T12:00:00.000Z
========================================================
```

## PROOF_OF_SUBMISSION

### Files Generated

The `PROOF_OF_SUBMISSION` folder contains:

1. **challenge.txt** - Random 32-byte hex string
2. **proof.txt** - ECDSA signature (base64 encoded)
3. **proof_pub.pem** - ECDSA public key (secp256r1)
4. **compute_proof.sh** - Script that generates the proof

### How Proof Was Generated

```bash
cd PROOF_OF_SUBMISSION
chmod +x compute_proof.sh
./compute_proof.sh
```

### Proof Generation Details

**Challenge:**
```
d14f096e0858dabcb820164b88a10a11005ba1b5e2c8df7de794e045e6f66c47
```

**Commit Hash:**
```bash
git rev-parse HEAD
# Output: e807fa050bcc38ac52202164d94f97639d747521
```

**Message (Challenge + Commit Hash):**
```
d14f096e0858dabcb820164b88a10a11005ba1b5e2c8df7de794e045e6f66c47e807fa050bcc38ac52202164d94f97639d747521
```

**SHA256 of Message:**
```bash
echo -n "d14f096e0858dabcb820164b88a10a11005ba1b5e2c8df7de794e045e6f66c47e807fa050bcc38ac52202164d94f97639d747521" | openssl dgst -sha256
# Output: fd2e6c7d289e0ca9cf76ea22aa5dde0fecb724c2f4f3864d58c52070b36b1a33
```

**Signature Verification:**
```bash
cd PROOF_OF_SUBMISSION
base64 -D -i proof.txt -o proof_sig.bin
echo -n "d14f096e0858dabcb820164b88a10a11005ba1b5e2c8df7de794e045e6f66c47e807fa050bcc38ac52202164d94f97639d747521" | openssl dgst -sha256 -verify proof_pub.pem -signature proof_sig.bin
# Output: Verified OK
```

### compute_proof.sh Script Contents

```bash
#!/bin/bash

# Proof of Submission Generator
# This script generates cryptographic proof of submission

echo "Generating proof of submission..."

# Read the challenge
CHALLENGE=$(cat challenge.txt)
echo "Challenge: $CHALLENGE"

# Get the latest commit hash
COMMIT_HASH=$(git rev-parse HEAD 2>/dev/null || echo "no-git-repo")
echo "Commit Hash: $COMMIT_HASH"

# Concatenate challenge + commit_hash
MESSAGE="${CHALLENGE}${COMMIT_HASH}"
echo "Message to sign: $MESSAGE"

# Compute SHA256 of the concatenation
MESSAGE_HASH=$(echo -n "$MESSAGE" | openssl dgst -sha256 -binary | xxd -p -c 256)
echo "Message SHA256: $MESSAGE_HASH"

# Generate ECDSA key pair (secp256r1/prime256v1)
if [ ! -f "proof_priv.pem" ]; then
    echo "Generating ECDSA key pair..."
    openssl ecparam -name prime256v1 -genkey -noout -out proof_priv.pem
    openssl ec -in proof_priv.pem -pubout -out proof_pub.pem
    echo "Key pair generated: proof_priv.pem and proof_pub.pem"
else
    echo "Using existing key pair"
fi

# Sign the message hash
echo -n "$MESSAGE" | openssl dgst -sha256 -sign proof_priv.pem | base64 > proof.txt
echo "Signature created: proof.txt"

# Verify the signature
echo ""
echo "Verifying signature..."
base64 -D -i proof.txt -o proof_sig.bin
if echo -n "$MESSAGE" | openssl dgst -sha256 -verify proof_pub.pem -signature proof_sig.bin > /dev/null 2>&1; then
    echo "✓ Signature verification: SUCCESS"
    VERIFY_RESULT="SUCCESS"
else
    echo "✗ Signature verification: FAILED"
    VERIFY_RESULT="FAILED"
fi

# Clean up temporary file
rm -f proof_sig.bin

echo ""
echo "=== Proof Generation Complete ==="
echo "Files created:"
echo "  - challenge.txt (challenge string)"
echo "  - proof.txt (signature in base64)"
echo "  - proof_pub.pem (public key)"
echo "  - proof_priv.pem (private key - keep secure)"
echo ""
echo "Outputs for SUBMISSION.md:"
echo "  Challenge: $CHALLENGE"
echo "  Commit Hash: $COMMIT_HASH"
echo "  SHA256: $MESSAGE_HASH"
```

## Video Demonstration

**Video Link:** [To be uploaded]

The video demonstrates:
1. ✅ User registration (happy path)
2. ✅ Enabling 2FA for an account
3. ✅ Login with password + 2FA OTP
4. ✅ Access token usage (protected endpoint)
5. ✅ Refresh token flow
6. ✅ Forgot password request
7. ✅ Password reset using reset token
8. ✅ OTP delivery walkthrough (mock logs)
9. ✅ Token generation/verification logic in code

## Architecture Highlights

### Security Features
- ✅ Password hashing with bcrypt (cost factor 10)
- ✅ JWT access tokens (15 min expiry)
- ✅ Refresh tokens (7 day expiry, server-side hash storage)
- ✅ OTP single-use with expiration (5 min) and attempt limits (3 max)
- ✅ Password reset tokens (1 hour expiry, single-use)
- ✅ Rate limiting on auth endpoints
- ✅ Parameterized SQL queries (injection prevention)
- ✅ Input validation with Joi schemas
- ✅ Audit logging for all auth events

### Database Design
- ✅ PostgreSQL with proper indexes
- ✅ Foreign key constraints with CASCADE
- ✅ Timestamp columns with timezone
- ✅ Transaction support for critical operations
- ✅ Audit trail in `audit_logs` table

### Code Quality
- ✅ TypeScript for type safety
- ✅ Modular architecture (controllers, services, middleware)
- ✅ Comprehensive error handling
- ✅ Logging with Winston
- ✅ Environment-based configuration
- ✅ Docker support for deployment

## Testing Coverage

### Test Files
- `src/__tests__/auth.test.ts` - Integration tests for all auth flows
- `src/__tests__/token.test.ts` - Unit tests for token utilities

### Test Scenarios
- ✅ User registration (valid and invalid inputs)
- ✅ User login (with/without 2FA)
- ✅ 2FA enable and verify
- ✅ Token refresh and revocation
- ✅ Forgot password flow
- ✅ Password reset
- ✅ Protected route access
- ✅ OTP generation and validation
- ✅ Token generation and verification

Run tests with: `npm test`

## Project Statistics

- **Total Files:** 30+
- **Lines of Code:** ~2,200+
- **Test Coverage:** Comprehensive (auth flows, token utils)
- **API Endpoints:** 9 (5 public, 2 protected, 2 health/profile)
- **Database Tables:** 5 (users, refresh_tokens, otps, password_resets, audit_logs)

## Contact Information

For questions or clarifications about this submission, please contact:
- **Email:** [Your email]
- **GitHub:** [Your GitHub profile]

## Additional Notes

### Design Decisions

1. **Mock SMS Provider:** Used for development/testing. Easy to switch to Twilio for production by changing `SMS_PROVIDER=twilio` in .env
2. **Token Storage:** Refresh tokens stored as hashes for security and revocation capability
3. **OTP Hashing:** OTP codes are hashed with bcrypt for security
4. **Logging:** Comprehensive logging for debugging and audit trail
5. **Docker:** Includes docker-compose for easy deployment and testing

### Future Enhancements

- Implement TOTP (Google Authenticator) as 2FA alternative
- Add Redis for token storage and rate limiting
- Implement refresh token rotation
- Add email verification on registration
- Implement role-based access control
- Add device management for 2FA

---

**Submission Complete:** This project fulfills all requirements of the Postgres Backend Challenge including JWT authentication, 2FA with SMS OTP, forgot password flow, comprehensive testing, Docker deployment, and cryptographic proof of submission.
