# Video Recording Guide

## 📹 How to Record Your 6-Minute Demonstration

### Before Recording

1. **Start the server:**
   ```bash
   docker-compose up -d postgres
   npm run dev
   ```

2. **Ensure logs directory exists:**
   ```bash
   mkdir -p logs
   ```

3. **Have these windows ready:**
   - Terminal 1: Running server (to show OTPs in console)
   - Terminal 2: For running curl commands
   - Browser: For viewing `logs/otp.log` file
   - Code editor: For showing code structure

### Recording Structure (6 minutes)

#### Part 1: Introduction (30 seconds)
- Show project structure in file explorer
- Highlight key folders: `src/`, `PROOF_OF_SUBMISSION/`, documentation

#### Part 2: Feature Demonstrations (4 minutes)

**Option A: Use the Demo Script**
```bash
chmod +x demo-script.sh
./demo-script.sh
```
This interactive script walks through all features with proper pauses.

**Option B: Manual curl Commands**

1. **Registration (30s)**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"demo@example.com","password":"SecurePass123!","phone":"+15551234567"}'
   ```

2. **Login without 2FA (20s)**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"demo@example.com","password":"SecurePass123!"}'
   ```
   Save the accessToken and refreshToken!

3. **Access Protected Endpoint (20s)**
   ```bash
   curl -X GET http://localhost:3000/api/auth/profile \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

4. **Enable 2FA (40s)**
   ```bash
   # Enable
   curl -X POST http://localhost:3000/api/auth/2fa/enable \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   
   # Show OTP in logs/otp.log or console
   tail -f logs/otp.log
   
   # Verify OTP
   curl -X POST "http://localhost:3000/api/auth/2fa/verify?userId=USER_ID&purpose=enable_2fa" \
     -H "Content-Type: application/json" \
     -d '{"otp":"123456"}'
   ```

5. **Login with 2FA (40s)**
   ```bash
   # Step 1: Login
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"demo@example.com","password":"SecurePass123!"}'
   
   # Step 2: Check OTP in logs
   tail -f logs/otp.log
   
   # Step 3: Verify OTP
   curl -X POST "http://localhost:3000/api/auth/2fa/verify?userId=USER_ID&purpose=login_2fa" \
     -H "Content-Type: application/json" \
     -d '{"otp":"654321"}'
   ```

6. **Refresh Token (20s)**
   ```bash
   curl -X POST http://localhost:3000/api/auth/token/refresh \
     -H "Content-Type: application/json" \
     -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
   ```

7. **Forgot Password (40s)**
   ```bash
   # Request reset
   curl -X POST http://localhost:3000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"demo@example.com"}'
   
   # Show reset token in console
   # Then reset
   curl -X POST http://localhost:3000/api/auth/reset-password \
     -H "Content-Type: application/json" \
     -d '{"token":"RESET_TOKEN","newPassword":"NewSecurePass123!"}'
   ```

#### Part 3: Code Walkthrough (1 minute)

Show these key files briefly:
1. **OTP Delivery** - `src/utils/sms.ts` (MockSMSProvider)
2. **Token Generation** - `src/utils/token.ts` (TokenService)
3. **Auth Service** - `src/services/auth.service.ts` (main logic)
4. **Database Schema** - `src/database/migrations/001_initial_schema.sql`

#### Part 4: PROOF_OF_SUBMISSION (30 seconds)
```bash
cd PROOF_OF_SUBMISSION
cat challenge.txt
./compute_proof.sh
cat proof.txt
```
Show the verification succeeds.

### Recording Tips

1. **Screen Setup:**
   - Use 1920x1080 resolution
   - Zoom terminal text to be readable
   - Use `jq` for pretty JSON output (install: `brew install jq`)

2. **Audio:**
   - Explain what you're doing briefly
   - Mention security features (bcrypt, JWT expiry, rate limiting)

3. **Pacing:**
   - Don't rush - 6 minutes is enough time
   - Pause briefly between commands to show responses

4. **Tools:**
   - macOS: QuickTime, OBS
   - Windows: OBS, Snagit
   - Linux: OBS, SimpleScreenRecorder

### What to Emphasize

- ✅ All endpoints working correctly
- ✅ OTP delivery mechanism (mock SMS logging)
- ✅ Token-based security (JWT, refresh tokens)
- ✅ Password reset flow security
- ✅ Code organization and structure
- ✅ Database schema design
- ✅ Cryptographic proof verification

### Upload Locations

- YouTube (unlisted)
- Google Drive (with link sharing)
- Dropbox
- Vimeo

Add the video link to `SUBMISSION.md` before final submission!

### Final Checklist

- [ ] Server running successfully
- [ ] All API endpoints demonstrated
- [ ] OTP logs visible
- [ ] Password reset token shown
- [ ] Code walkthrough completed
- [ ] PROOF_OF_SUBMISSION verified
- [ ] Video under 6 minutes
- [ ] Audio clear and audible
- [ ] Screen resolution readable
- [ ] Video uploaded
- [ ] Link added to SUBMISSION.md
