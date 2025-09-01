#!/bin/bash
# Development startup script for What's the Chance? Game

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting What's the Chance? Game Development Environment${NC}"

# Check if required tools are installed
check_requirements() {
    echo -e "${BLUE}🔍 Checking requirements...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+${NC}"
        exit 1
    fi
    
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}❌ Python 3 is not installed. Please install Python 3.11+${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Requirements check passed${NC}"
}

# Install dependencies if needed
install_deps() {
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
        npm install
    fi
    
    if [ ! -d "backend/.venv" ] && [ ! -f "backend/.deps_installed" ]; then
        echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
        cd backend
        pip install -r requirements.txt
        touch .deps_installed
        cd ..
    fi
}

# Start services
start_services() {
    echo -e "${BLUE}🎯 Starting development servers...${NC}"
    echo -e "${YELLOW}Frontend will be available at: http://localhost:5173${NC}"
    echo -e "${YELLOW}Backend will be available at: http://localhost:8000${NC}"
    echo -e "${YELLOW}API Documentation: http://localhost:8000/docs${NC}"
    echo ""
    echo -e "${BLUE}Press Ctrl+C to stop all services${NC}"
    echo ""
    
    # Function to handle cleanup
    cleanup() {
        echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
        kill 0
        exit 0
    }
    
    # Set trap to catch Ctrl+C
    trap cleanup INT
    
    # Start backend
    echo -e "${BLUE}⚙️  Starting backend server...${NC}"
    cd backend
    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    cd ..
    
    # Give backend time to start
    sleep 2
    
    # Start frontend
    echo -e "${BLUE}🎨 Starting frontend server...${NC}"
    npm run dev &
    FRONTEND_PID=$!
    
    # Wait for services to start
    sleep 3
    
    # Check if services are running
    if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is running${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend might still be starting...${NC}"
    fi
    
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is running${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend might still be starting...${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Development environment is ready!${NC}"
    echo -e "${BLUE}Open your browser to http://localhost:5173 to start developing${NC}"
    
    # Wait for processes
    wait
}

# Main execution
main() {
    check_requirements
    install_deps
    start_services
}

# Handle command line arguments
case "${1:-}" in
    --no-install)
        check_requirements
        start_services
        ;;
    --help|-h)
        echo "Usage: $0 [options]"
        echo "Options:"
        echo "  --no-install    Skip dependency installation"
        echo "  --help, -h      Show this help message"
        exit 0
        ;;
    *)
        main
        ;;
esac
