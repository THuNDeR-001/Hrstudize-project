#!/bin/bash

# Video Demonstration Script
# This script demonstrates all required features for the submission video

echo "========================================="
echo "PostgreSQL JWT Auth - Video Demo Script"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${BLUE}=== 1. REGISTRATION (Happy Path) ===${NC}"
echo ""
echo "Registering new user: videodemo@example.com"
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "videodemo@example.com",
    "password": "SecurePass123!",
    "phone": "+15551234567"
  }')
echo "$REGISTER_RESPONSE" | jq '.'
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.user.id')
echo -e "${GREEN}✓ User registered successfully${NC}"
echo "User ID: $USER_ID"
echo ""
read -p "Press Enter to continue..."
echo ""

echo -e "${BLUE}=== 2. LOGIN (Without 2FA) ===${NC}"
echo ""
echo "Logging in as videodemo@example.com"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "videodemo@example.com",
    "password": "SecurePass123!"
  }')
echo "$LOGIN_RESPONSE" | jq '.'
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.refreshToken')
echo -e "${GREEN}✓ Login successful${NC}"
echo "Access Token: ${ACCESS_TOKEN:0:50}..."
echo "Refresh Token: ${REFRESH_TOKEN:0:50}..."
echo ""
read -p "Press Enter to continue..."
echo ""

echo -e "${BLUE}=== 3. ACCESS PROTECTED ENDPOINT ===${NC}"
echo ""
echo "Calling GET /api/auth/profile with access token"
PROFILE_RESPONSE=$(curl -s -X GET $BASE_URL/api/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "$PROFILE_RESPONSE" | jq '.'
echo -e "${GREEN}✓ Protected endpoint accessed successfully${NC}"
echo ""
read -p "Press Enter to continue..."
echo ""

echo -e "${BLUE}=== 4. ENABLE 2FA ===${NC}"
echo ""
echo "Enabling 2FA for the account"
ENABLE_2FA_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/2fa/enable \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "$ENABLE_2FA_RESPONSE" | jq '.'
echo -e "${GREEN}✓ 2FA enable request sent${NC}"
echo ""
echo -e "${YELLOW}⚠ Check logs/otp.log or console for the OTP code${NC}"
echo "Tailing OTP log (last 5 lines):"
tail -n 5 logs/otp.log 2>/dev/null || echo "Log file not found yet"
echo ""
read -p "Enter the OTP code from the log: " OTP_CODE
echo ""

echo "Verifying OTP to complete 2FA setup"
VERIFY_2FA_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/2fa/verify?userId=$USER_ID&purpose=enable_2fa" \
  -H "Content-Type: application/json" \
  -d "{
    \"otp\": \"$OTP_CODE\"
  }")
echo "$VERIFY_2FA_RESPONSE" | jq '.'
echo -e "${GREEN}✓ 2FA enabled successfully${NC}"
echo ""
read -p "Press Enter to continue..."
echo ""

echo -e "${BLUE}=== 5. LOGIN WITH 2FA ===${NC}"
echo ""
echo "Step 1: Initial login (will require 2FA)"
LOGIN_2FA_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "videodemo@example.com",
    "password": "SecurePass123!"
  }')
echo "$LOGIN_2FA_RESPONSE" | jq '.'
echo -e "${YELLOW}⚠ 2FA required - check logs for new OTP${NC}"
echo ""
echo "Tailing OTP log (last 5 lines):"
tail -n 5 logs/otp.log 2>/dev/null || echo "Log file not found yet"
echo ""
read -p "Enter the OTP code from the log: " OTP_CODE_2
echo ""

echo "Step 2: Verifying OTP to complete login"
VERIFY_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/2fa/verify?userId=$USER_ID&purpose=login_2fa" \
  -H "Content-Type: application/json" \
  -d "{
    \"otp\": \"$OTP_CODE_2\"
  }")
echo "$VERIFY_LOGIN_RESPONSE" | jq '.'
NEW_ACCESS_TOKEN=$(echo "$VERIFY_LOGIN_RESPONSE" | jq -r '.accessToken')
NEW_REFRESH_TOKEN=$(echo "$VERIFY_LOGIN_RESPONSE" | jq -r '.refreshToken')
echo -e "${GREEN}✓ Login with 2FA successful${NC}"
echo ""
read -p "Press Enter to continue..."
echo ""

echo -e "${BLUE}=== 6. REFRESH TOKEN FLOW ===${NC}"
echo ""
echo "Using refresh token to get new access token"
REFRESH_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/token/refresh \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$NEW_REFRESH_TOKEN\"
  }")
echo "$REFRESH_RESPONSE" | jq '.'
REFRESHED_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.accessToken')
echo -e "${GREEN}✓ Token refreshed successfully${NC}"
echo "New Access Token: ${REFRESHED_ACCESS_TOKEN:0:50}..."
echo ""
read -p "Press Enter to continue..."
echo ""

echo -e "${BLUE}=== 7. FORGOT PASSWORD ===${NC}"
echo ""
echo "Requesting password reset for videodemo@example.com"
FORGOT_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "videodemo@example.com"
  }')
echo "$FORGOT_RESPONSE" | jq '.'
echo -e "${GREEN}✓ Password reset requested${NC}"
echo ""
echo -e "${YELLOW}⚠ Check console or logs/combined.log for reset token${NC}"
echo "Checking recent logs:"
tail -n 20 logs/combined.log 2>/dev/null | grep -A 3 "PASSWORD RESET" || echo "Check console output for reset token"
echo ""
read -p "Enter the reset token from the log: " RESET_TOKEN
echo ""

echo -e "${BLUE}=== 8. RESET PASSWORD ===${NC}"
echo ""
echo "Resetting password with token"
RESET_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d "{
    \"token\": \"$RESET_TOKEN\",
    \"newPassword\": \"NewSecurePass123!\"
  }")
echo "$RESET_RESPONSE" | jq '.'
echo -e "${GREEN}✓ Password reset successfully${NC}"
echo ""
read -p "Press Enter to continue..."
echo ""

echo -e "${BLUE}=== 9. LOGIN WITH NEW PASSWORD ===${NC}"
echo ""
echo "Logging in with new password"
NEW_LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "videodemo@example.com",
    "password": "NewSecurePass123!"
  }')
echo "$NEW_LOGIN_RESPONSE" | jq '.'
echo -e "${GREEN}✓ Login with new password successful (2FA will be required)${NC}"
echo ""

echo ""
echo "========================================="
echo -e "${GREEN}✓ ALL DEMONSTRATIONS COMPLETE${NC}"
echo "========================================="
echo ""
echo "Summary of what was demonstrated:"
echo "1. ✓ User registration"
echo "2. ✓ Login without 2FA"
echo "3. ✓ Protected endpoint access with JWT"
echo "4. ✓ 2FA enable with OTP verification"
echo "5. ✓ Login with 2FA (two-step)"
echo "6. ✓ Refresh token flow"
echo "7. ✓ Forgot password request"
echo "8. ✓ Password reset with token"
echo "9. ✓ Login with new password"
echo ""
echo "OTP Logs Location: logs/otp.log"
echo "Application Logs: logs/combined.log"
echo ""
