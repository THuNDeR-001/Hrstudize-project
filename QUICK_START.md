# Quick Reference Guide

## 🚀 Start the Application

### Using Docker (Easiest)
```bash
docker-compose up --build
```
API will be available at `http://localhost:3000`

### Using Local Development
```bash
npm install
cp .env.example .env
npm run migrate
npm run seed
npm run dev
```

## 🧪 Run Tests
```bash
npm test
```

## 📝 Test Credentials
- **Email:** `testuser@example.com`
- **Password:** `Password123!`

## 🔍 Find OTPs and Reset Tokens

### OTPs (2FA codes)
```bash
tail -f logs/otp.log
# OR check console output
```

### Reset Tokens
```bash
tail -f logs/combined.log
# OR check console output
```

## 📋 Common Commands

### Database
```bash
npm run migrate    # Run migrations
npm run seed       # Seed test data
```

### Development
```bash
npm run dev        # Start with hot reload
npm run build      # Build TypeScript
npm start          # Start production
```

### Testing
```bash
npm test           # Run all tests
npm run test:watch # Watch mode
```

## 🔐 Quick API Test

### 1. Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Password123!","phone":"+11234567890"}'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Password123!"}'
```

### 3. Get Profile (use token from login)
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📊 Project Stats
- **Files:** 41 source files
- **Language:** TypeScript
- **Database Tables:** 5
- **API Endpoints:** 9
- **Tests:** Comprehensive coverage
- **Size:** ~628KB (without node_modules)

## 📁 Key Files
- `README.md` - Full documentation
- `SUBMISSION.md` - Submission guide
- `API_TESTING.md` - API examples
- `PROJECT_SUMMARY.md` - Project overview
- `CHECKLIST.md` - Feature checklist
- `verify.sh` - Verification script

## 🎯 Next Steps
1. ✅ Code is complete
2. ✅ Tests are passing
3. ✅ Documentation is ready
4. ⏳ Record demo video (max 6 minutes)
5. ⏳ Submit repository + video

## 💡 Tips
- Check `logs/` folder for OTPs and reset tokens
- Use `verify.sh` to check project completeness
- See `API_TESTING.md` for detailed curl examples
- Read `SUBMISSION.md` for submission instructions

## 🆘 Troubleshooting

### Database connection fails
```bash
# Check PostgreSQL is running
docker-compose ps
# OR
pg_isready -h localhost -p 5432
```

### OTPs not showing
```bash
# Check logs directory exists
mkdir -p logs
# Restart application
```

### Tests failing
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support
See detailed documentation in README.md or SUBMISSION.md
