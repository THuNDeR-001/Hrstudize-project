# PostgreSQL Backend - JWT Authentication + 2FA + Forgot Password

A production-ready RESTful backend authentication system built with Node.js, Express, TypeScript, and PostgreSQL. Features include JWT-based authentication, two-factor authentication (2FA) via SMS OTP, secure password reset flow, and comprehensive security measures.

## 🚀 Features

- ✅ **User Registration** with email, password, and phone number
- ✅ **JWT Authentication** with access and refresh token pattern
- ✅ **Two-Factor Authentication (2FA)** via SMS OTP
- ✅ **Forgot Password Flow** with secure, single-use tokens
- ✅ **Protected Routes** with JWT middleware
- ✅ **Rate Limiting** to prevent brute force attacks
- ✅ **Comprehensive Testing** with Jest and Supertest
- ✅ **Docker Support** for easy deployment
- ✅ **Audit Logging** for security events
- ✅ **Input Validation** with Joi
- ✅ **Password Hashing** with bcrypt (cost factor 10)
- ✅ **SQL Injection Protection** via parameterized queries

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Security Features](#security-features)
- [Testing](#testing)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Development](#development)
- [Production Deployment](#production-deployment)

## Prerequisites

- Node.js 20+ and npm
- PostgreSQL 16+
- Docker and Docker Compose (optional, for containerized deployment)
- Git

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd postgres-jwt-auth-backend

# Copy environment file
cp .env.example .env

# Start the application with Docker
docker-compose up --build
```

The application will be available at `http://localhost:3000`

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Run database migrations
npm run migrate

# Seed the database (optional)
npm run seed

# Start development server
npm run dev
```

## API Endpoints

### Base URL
```
http://localhost:3000/api/auth
```

### Public Endpoints

#### 1. Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "phone": "+11234567890"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "phone": "+11234567890"
  }
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response (without 2FA):**
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "is2FAEnabled": false
  }
}
```

**Response (with 2FA enabled):**
```json
{
  "message": "2FA verification required. OTP sent to your phone.",
  "requires2FA": true,
  "userId": "uuid"
}
```

#### 3. Verify OTP (for 2FA)
```http
POST /api/auth/2fa/verify?userId=<uuid>&purpose=login_2fa
Content-Type: application/json

{
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 4. Refresh Token
```http
POST /api/auth/token/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 5. Logout
```http
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 6. Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Note:** The reset token will be logged to the console/logs (in production, send via email)

#### 7. Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "NewPassword123!"
}
```

### Protected Endpoints

#### 8. Enable 2FA
```http
POST /api/auth/2fa/enable
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "message": "OTP sent to your phone. Verify to complete 2FA setup."
}
```

Then verify with:
```http
POST /api/auth/2fa/verify?userId=<uuid>&purpose=enable_2fa
Content-Type: application/json

{
  "otp": "123456"
}
```

#### 9. Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "profile": {
    "id": "uuid",
    "email": "user@example.com",
    "phone": "+11234567890",
    "is_active": true,
    "is_2fa_enabled": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

## Project Structure

```
postgres-jwt-auth-backend/
├── src/
│   ├── __tests__/           # Test files
│   │   ├── auth.test.ts
│   │   └── token.test.ts
│   ├── config/              # Configuration
│   │   └── index.ts
│   ├── controllers/         # Route controllers
│   │   └── auth.controller.ts
│   ├── database/            # Database setup
│   │   ├── migrations/
│   │   │   └── 001_initial_schema.sql
│   │   ├── seeds/
│   │   │   └── 001_test_users.sql
│   │   ├── index.ts
│   │   ├── migrate.ts
│   │   └── seed.ts
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   ├── rateLimit.ts
│   │   └── validation.ts
│   ├── routes/              # API routes
│   │   └── auth.routes.ts
│   ├── services/            # Business logic
│   │   └── auth.service.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   ├── logger.ts
│   │   ├── sms.ts
│   │   ├── token.ts
│   │   └── validation.ts
│   └── index.ts             # Application entry point
├── PROOF_OF_SUBMISSION/     # Cryptographic proof
│   ├── challenge.txt
│   ├── compute_proof.sh
│   ├── proof.txt
│   └── proof_pub.pem
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
├── jest.config.js
├── .env.example
├── README.md
├── SUBMISSION.md
└── CHECKLIST.md
```

## Security Features

### Password Security
- **Hashing Algorithm:** bcrypt with cost factor 10
- **Password Requirements:** Minimum 8 characters, must include uppercase, lowercase, number, and special character
- **Password Reset:** Single-use tokens with 1-hour expiration

### JWT Tokens
- **Access Token:** Short-lived (15 minutes), used for API authentication
- **Refresh Token:** Long-lived (7 days), stored server-side with hash
- **Token Revocation:** Refresh tokens can be revoked on logout or password reset

### OTP Security
- **Expiration:** 5 minutes
- **Attempts:** Maximum 3 attempts per OTP
- **Storage:** OTP codes are hashed with bcrypt
- **Single-use:** OTPs are marked as used after successful verification

### Rate Limiting
- **General API:** 100 requests per 15 minutes per IP
- **Auth Endpoints:** 5 requests per 15 minutes per IP (login, register, 2FA)

### SQL Injection Protection
- All database queries use parameterized statements
- No raw SQL string concatenation

### Input Validation
- Joi schema validation on all endpoints
- Email format validation
- Phone number E.164 format validation
- Strong password requirements

### Audit Logging
- All authentication events are logged
- Includes: user_id, event_type, IP address, success/failure, metadata

## Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Test Coverage
The test suite includes:
- User registration (happy path and validation)
- User login (with and without 2FA)
- 2FA enable and verify
- Token refresh and revocation
- Forgot password and reset password
- Protected route access
- Token service unit tests

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=auth_db
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# OTP
OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=3

# Password Reset
RESET_TOKEN_EXPIRY_HOURS=1

# SMS Provider (mock or twilio)
SMS_PROVIDER=mock
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Database Schema

### Tables

#### users
- `id` UUID PRIMARY KEY
- `email` TEXT UNIQUE NOT NULL
- `password_hash` TEXT NOT NULL
- `phone` TEXT (E.164 format)
- `is_active` BOOLEAN DEFAULT true
- `is_2fa_enabled` BOOLEAN DEFAULT false
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ

#### refresh_tokens
- `id` UUID PRIMARY KEY
- `user_id` UUID REFERENCES users(id)
- `token_hash` TEXT
- `expires_at` TIMESTAMPTZ
- `revoked` BOOLEAN
- `device_info` TEXT
- `ip_address` TEXT
- `created_at` TIMESTAMPTZ

#### otps
- `id` UUID PRIMARY KEY
- `user_id` UUID REFERENCES users(id)
- `code_hash` TEXT
- `purpose` TEXT (login_2fa, enable_2fa)
- `expires_at` TIMESTAMPTZ
- `used` BOOLEAN
- `attempts` INTEGER
- `created_at` TIMESTAMPTZ

#### password_resets
- `id` UUID PRIMARY KEY
- `user_id` UUID REFERENCES users(id)
- `token_hash` TEXT
- `expires_at` TIMESTAMPTZ
- `used` BOOLEAN
- `created_at` TIMESTAMPTZ

#### audit_logs
- `id` UUID PRIMARY KEY
- `user_id` UUID REFERENCES users(id)
- `event_type` TEXT
- `ip_address` TEXT
- `user_agent` TEXT
- `success` BOOLEAN
- `metadata` JSONB
- `created_at` TIMESTAMPTZ

## Development

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm test             # Run tests
npm run migrate      # Run database migrations
npm run seed         # Seed database with test data
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Accessing OTPs in Development

When `SMS_PROVIDER=mock`, OTPs are logged to:
1. Console output
2. `logs/otp.log` file

Example:
```
[MOCK SMS] To: +11234567890, Message: Your login OTP is: 123456
```

### Accessing Password Reset Tokens

Reset tokens are logged to:
1. Console output
2. Application logs

Example:
```
Password reset token for user@example.com: abc123def456...
```

## Production Deployment

### Docker Deployment

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Production Checklist

- [ ] Change all JWT secrets in `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Configure real SMS provider (Twilio)
- [ ] Set up email service for password reset
- [ ] Configure HTTPS/TLS
- [ ] Set up database backups
- [ ] Configure monitoring and alerting
- [ ] Review and adjust rate limits
- [ ] Set up log aggregation
- [ ] Configure CORS for specific origins

## Security Considerations

### Design Trade-offs

1. **Token Storage:** Refresh tokens are stored server-side as hashes to allow revocation
2. **OTP Delivery:** Mock SMS provider for development; Twilio integration for production
3. **Password Reset:** Tokens logged for demo; should use email service in production
4. **Rate Limiting:** IP-based; consider user-based rate limiting for production
5. **Session Management:** Stateless JWTs with server-side refresh token validation

### Potential Improvements

- [ ] Add Redis for refresh token storage and rate limiting
- [ ] Implement TOTP (Google Authenticator) as 2FA alternative
- [ ] Add device fingerprinting
- [ ] Implement refresh token rotation
- [ ] Add account lockout after failed login attempts
- [ ] Implement CSRF protection
- [ ] Add email verification on registration
- [ ] Implement role-based access control (RBAC)

## License

ISC

## Author

Developed as part of the Postgres Backend Challenge

---

For questions or issues, please refer to SUBMISSION.md for contact information.
