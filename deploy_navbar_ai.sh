#!/bin/bash

# Deployment script for LLM-powered Navbar Integration
# Run this to deploy both frontend and backend with the new navbar features

echo "🚀 Deploying Health Care Analysis with LLM-Powered Navbar"
echo "=========================================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Frontend Deployment
echo -e "${BLUE}[1/2]${NC} Deploying Frontend..."
cd FrontEnd

# Build frontend
echo "  - Building frontend..."
npm run build

# Deploy to Vercel
echo "  - Deploying to Vercel..."
vercel --prod

echo -e "${GREEN}✓ Frontend deployed${NC}"

# Step 2: Backend Deployment
echo -e "${BLUE}[2/2]${NC} Preparing Backend (Manual Deployment Required)..."
cd ../health-backend-java/health-backend

echo -e "${YELLOW}⚠️  Next Steps for Backend:${NC}"
echo "  1. Ensure GEMINI_API_KEY is set in your environment"
echo "  2. Deploy to your hosting platform (Vercel, Railway, etc.)"
echo "  3. Update VITE_API_URL in FrontEnd/.env with your backend URL"
echo "  4. Redeploy frontend if backend URL changed"
echo ""
echo "  Deploy command for Vercel:"
echo "    vercel --prod"
echo ""

echo -e "${GREEN}✓ LLM-Powered Navbar Integration Complete!${NC}"
echo ""
echo "📚 Documentation:"
echo "  - LLM_NAVBAR_INTEGRATION.md - Detailed implementation guide"
echo "  - NAVBAR_AI_QUICKSTART.md - Quick reference"
echo ""
echo "🔑 Key Files Modified:"
echo "  Frontend:"
echo "    ✓ src/services/navbarAIService.js (NEW)"
echo "    ✓ src/components/Navbar.jsx (UPDATED)"
echo "    ✓ src/components/Sidebar.jsx (UPDATED)"
echo ""
echo "  Backend:"
echo "    ✓ app/navbar_ai.py (NEW)"
echo "    ✓ app/main.py (UPDATED)"
echo ""
echo "🧪 Testing Checklist:"
echo "  [ ] Upload health data CSV"
echo "  [ ] Verify greeting displays in navbar"
echo "  [ ] Check health status badge appears"
echo "  [ ] Look for alert bell icon"
echo "  [ ] Verify sidebar shows recommendations"
echo "  [ ] Check health actions display"
echo "  [ ] Test alert popup functionality"
echo ""
echo "🎉 Happy analyzing!"
