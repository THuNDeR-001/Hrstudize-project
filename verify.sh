#!/bin/bash

# Verification Script
# This script verifies that all required components are in place

echo "========================================="
echo "Project Verification Script"
echo "========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $1 NOT FOUND"
        ((FAILED++))
    fi
}

# Function to check directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 directory exists"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $1 directory NOT FOUND"
        ((FAILED++))
    fi
}

echo "Checking project files..."
echo ""

# Core files
echo "Core Files:"
check_file "package.json"
check_file "tsconfig.json"
check_file "docker-compose.yml"
check_file "Dockerfile"
check_file ".env.example"
check_file "jest.config.js"
echo ""

# Documentation
echo "Documentation:"
check_file "README.md"
check_file "SUBMISSION.md"
check_file "CHECKLIST.md"
check_file "API_TESTING.md"
echo ""

# Source directories
echo "Source Directories:"
check_dir "src"
check_dir "src/config"
check_dir "src/controllers"
check_dir "src/database"
check_dir "src/middleware"
check_dir "src/routes"
check_dir "src/services"
check_dir "src/types"
check_dir "src/utils"
check_dir "src/__tests__"
echo ""

# Database files
echo "Database Files:"
check_dir "src/database/migrations"
check_dir "src/database/seeds"
check_file "src/database/migrations/001_initial_schema.sql"
check_file "src/database/seed.ts"
check_file "src/database/migrate.ts"
echo ""

# Source files
echo "Core Source Files:"
check_file "src/index.ts"
check_file "src/config/index.ts"
check_file "src/controllers/auth.controller.ts"
check_file "src/services/auth.service.ts"
check_file "src/routes/auth.routes.ts"
check_file "src/middleware/auth.ts"
check_file "src/utils/token.ts"
check_file "src/utils/sms.ts"
echo ""

# Test files
echo "Test Files:"
check_file "src/__tests__/auth.test.ts"
check_file "src/__tests__/token.test.ts"
echo ""

# PROOF_OF_SUBMISSION
echo "PROOF_OF_SUBMISSION Files:"
check_dir "PROOF_OF_SUBMISSION"
check_file "PROOF_OF_SUBMISSION/challenge.txt"
check_file "PROOF_OF_SUBMISSION/compute_proof.sh"
check_file "PROOF_OF_SUBMISSION/proof.txt"
check_file "PROOF_OF_SUBMISSION/proof_pub.pem"
echo ""

# Check if git is initialized
echo "Git Repository:"
if [ -d ".git" ]; then
    echo -e "${GREEN}✓${NC} Git repository initialized"
    COMMIT_HASH=$(git rev-parse HEAD 2>/dev/null)
    echo -e "${GREEN}✓${NC} Latest commit: $COMMIT_HASH"
    ((PASSED+=2))
else
    echo -e "${RED}✗${NC} Git repository NOT initialized"
    ((FAILED+=2))
fi
echo ""

# Verify proof signature
echo "Verifying Cryptographic Proof:"
cd PROOF_OF_SUBMISSION
if [ -f "proof.txt" ] && [ -f "proof_pub.pem" ] && [ -f "challenge.txt" ]; then
    CHALLENGE=$(cat challenge.txt)
    COMMIT_HASH=$(git rev-parse HEAD 2>/dev/null || echo "no-git")
    MESSAGE="${CHALLENGE}${COMMIT_HASH}"
    
    base64 -D -i proof.txt -o proof_sig_verify.bin 2>/dev/null
    if echo -n "$MESSAGE" | openssl dgst -sha256 -verify proof_pub.pem -signature proof_sig_verify.bin > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Signature verification: SUCCESS"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} Signature verification: FAILED"
        ((FAILED++))
    fi
    rm -f proof_sig_verify.bin
else
    echo -e "${RED}✗${NC} Proof files missing"
    ((FAILED++))
fi
cd ..
echo ""

# Check if node_modules exists (dependencies installed)
echo "Dependencies:"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Dependencies installed (node_modules exists)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Dependencies not installed (run: npm install)"
fi
echo ""

# Summary
echo "========================================="
echo "Verification Summary"
echo "========================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Project is ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Install dependencies: npm install"
    echo "2. Start with Docker: docker-compose up --build"
    echo "   OR start locally: npm run migrate && npm run seed && npm run dev"
    echo "3. Run tests: npm test"
    exit 0
else
    echo -e "${RED}✗ Some checks failed. Please review the errors above.${NC}"
    exit 1
fi
