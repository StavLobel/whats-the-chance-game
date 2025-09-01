# What's the Chance? Game - Makefile
# Comprehensive task automation for development, testing, and deployment

.PHONY: help install dev dev-frontend dev-backend test test-unit test-e2e build clean docker-dev docker-prod deploy lint format check-env setup

# Default target
.DEFAULT_GOAL := help

# Variables
NODE_VERSION := 18
PYTHON_VERSION := 3.11
DOCKER_COMPOSE := docker-compose
PROJECT_NAME := whats-the-chance-game

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
BLUE := \033[0;34m
PURPLE := \033[0;35m
CYAN := \033[0;36m
WHITE := \033[1;37m
NC := \033[0m # No Color

# Help target
help: ## Display this help message
	@echo "$(CYAN)What's the Chance? Game - Development Commands$(NC)"
	@echo ""
	@echo "$(WHITE)Available targets:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(WHITE)Examples:$(NC)"
	@echo "  $(YELLOW)make setup$(NC)          - First time setup"
	@echo "  $(YELLOW)make dev$(NC)            - Start development servers"
	@echo "  $(YELLOW)make test$(NC)           - Run all tests"
	@echo "  $(YELLOW)make docker-dev$(NC)     - Start with Docker"

##@ Setup & Installation
setup: check-env install ## Complete first-time setup
	@echo "$(GREEN)✅ Setup complete! Run 'make dev' to start development.$(NC)"

check-env: ## Check required environment variables and tools
	@echo "$(BLUE)🔍 Checking environment...$(NC)"
	@command -v node >/dev/null 2>&1 || { echo "$(RED)❌ Node.js is required but not installed.$(NC)"; exit 1; }
	@command -v python3 >/dev/null 2>&1 || { echo "$(RED)❌ Python 3 is required but not installed.$(NC)"; exit 1; }
	@command -v docker >/dev/null 2>&1 || echo "$(YELLOW)⚠️  Docker not found. Docker commands will not work.$(NC)"
	@test -f .env || { echo "$(YELLOW)⚠️  .env file not found. Copy env.example to .env and configure.$(NC)"; }
	@echo "$(GREEN)✅ Environment check complete.$(NC)"

install: ## Install all dependencies
	@echo "$(BLUE)📦 Installing dependencies...$(NC)"
	npm install
	cd backend && pip install -r requirements.txt
	npx playwright install
	@echo "$(GREEN)✅ Dependencies installed.$(NC)"

##@ Development
dev: ## Start both frontend and backend in development mode
	@echo "$(BLUE)🚀 Starting development servers...$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost:5173$(NC)"
	@echo "$(YELLOW)Backend: http://localhost:8000$(NC)"
	@echo "$(YELLOW)API Docs: http://localhost:8000/docs$(NC)"
	@trap 'kill 0' INT; \
	(cd backend && python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000) & \
	npm run dev

dev-frontend: ## Start only frontend development server
	@echo "$(BLUE)🎨 Starting frontend development server...$(NC)"
	npm run dev

dev-backend: ## Start only backend development server
	@echo "$(BLUE)⚙️  Starting backend development server...$(NC)"
	cd backend && python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

##@ Testing
test: test-unit test-e2e ## Run all tests (unit + E2E)

test-unit: ## Run unit tests for frontend and backend
	@echo "$(BLUE)🧪 Running unit tests...$(NC)"
	npm run test:unit
	cd backend && python -m pytest tests/unit/ -v

test-unit-frontend: ## Run frontend unit tests only
	@echo "$(BLUE)🧪 Running frontend unit tests...$(NC)"
	npm run test:unit

test-unit-backend: ## Run backend unit tests only
	@echo "$(BLUE)🧪 Running backend unit tests...$(NC)"
	cd backend && python -m pytest tests/unit/ -v

test-e2e: ## Run E2E tests
	@echo "$(BLUE)🎭 Running E2E tests...$(NC)"
	npm run test:e2e

test-e2e-ui: ## Run E2E tests with UI
	@echo "$(BLUE)🎭 Running E2E tests with UI...$(NC)"
	npm run test:e2e -- --ui

test-coverage: ## Generate test coverage reports
	@echo "$(BLUE)📊 Generating test coverage...$(NC)"
	npm run test:coverage
	cd backend && python -m pytest tests/ --cov=app --cov-report=html --cov-report=term

##@ Code Quality
lint: ## Run linting for all code
	@echo "$(BLUE)🔍 Running linters...$(NC)"
	npm run lint
	cd backend && python -m flake8 app/ tests/
	cd backend && python -m mypy app/

format: ## Format all code
	@echo "$(BLUE)✨ Formatting code...$(NC)"
	npm run format
	cd backend && python -m black app/ tests/
	cd backend && python -m isort app/ tests/

check: lint test-unit ## Run all checks (lint + unit tests)

##@ Building
build: ## Build production assets
	@echo "$(BLUE)🏗️  Building production assets...$(NC)"
	npm run build
	@echo "$(GREEN)✅ Build complete. Files in dist/$(NC)"

build-backend: ## Build backend Docker image
	@echo "$(BLUE)🏗️  Building backend Docker image...$(NC)"
	cd backend && docker build -t $(PROJECT_NAME)-backend .

build-frontend: ## Build frontend Docker image
	@echo "$(BLUE)🏗️  Building frontend Docker image...$(NC)"
	docker build -f Dockerfile.frontend.prod -t $(PROJECT_NAME)-frontend .

##@ Docker Development
docker-dev: ## Start development environment with Docker
	@echo "$(BLUE)🐳 Starting Docker development environment...$(NC)"
	$(DOCKER_COMPOSE) --profile dev up -d
	@echo "$(YELLOW)Frontend: http://localhost:5173$(NC)"
	@echo "$(YELLOW)Backend: http://localhost:8000$(NC)"

docker-dev-logs: ## Show Docker development logs
	$(DOCKER_COMPOSE) --profile dev logs -f

docker-dev-stop: ## Stop Docker development environment
	@echo "$(BLUE)🛑 Stopping Docker development environment...$(NC)"
	$(DOCKER_COMPOSE) --profile dev down

##@ Docker Production
docker-prod: ## Start production environment with Docker
	@echo "$(BLUE)🐳 Starting Docker production environment...$(NC)"
	$(DOCKER_COMPOSE) --profile production up -d
	@echo "$(GREEN)✅ Production environment started.$(NC)"

docker-prod-logs: ## Show Docker production logs
	$(DOCKER_COMPOSE) --profile production logs -f

docker-prod-stop: ## Stop Docker production environment
	@echo "$(BLUE)🛑 Stopping Docker production environment...$(NC)"
	$(DOCKER_COMPOSE) --profile production down

docker-build-all: build-frontend build-backend ## Build all Docker images

##@ Database & Services
db-reset: ## Reset development database (Firebase Firestore emulator)
	@echo "$(BLUE)🗄️  Resetting database...$(NC)"
	# Add Firebase emulator reset commands here if using emulator
	@echo "$(YELLOW)⚠️  Database reset not implemented yet.$(NC)"

redis-start: ## Start Redis service
	@echo "$(BLUE)🔴 Starting Redis...$(NC)"
	$(DOCKER_COMPOSE) up redis -d

redis-stop: ## Stop Redis service
	@echo "$(BLUE)🛑 Stopping Redis...$(NC)"
	$(DOCKER_COMPOSE) stop redis

##@ Deployment
deploy-staging: ## Deploy to staging environment
	@echo "$(BLUE)🚀 Deploying to staging...$(NC)"
	# Add staging deployment commands here
	@echo "$(YELLOW)⚠️  Staging deployment not configured yet.$(NC)"

deploy-prod: ## Deploy to production environment
	@echo "$(BLUE)🚀 Deploying to production...$(NC)"
	# Add production deployment commands here
	@echo "$(YELLOW)⚠️  Production deployment not configured yet.$(NC)"

##@ Maintenance
clean: ## Clean build artifacts and dependencies
	@echo "$(BLUE)🧹 Cleaning build artifacts...$(NC)"
	rm -rf dist/
	rm -rf backend/__pycache__/
	rm -rf backend/app/__pycache__/
	rm -rf node_modules/.cache/
	rm -rf .pytest_cache/
	rm -rf test-results/
	rm -rf playwright-report/
	@echo "$(GREEN)✅ Cleanup complete.$(NC)"

clean-all: clean ## Clean everything including node_modules
	@echo "$(BLUE)🧹 Deep cleaning...$(NC)"
	rm -rf node_modules/
	rm -rf backend/.venv/
	$(DOCKER_COMPOSE) down --volumes --remove-orphans
	docker system prune -f
	@echo "$(GREEN)✅ Deep cleanup complete.$(NC)"

update: ## Update all dependencies
	@echo "$(BLUE)📦 Updating dependencies...$(NC)"
	npm update
	cd backend && pip install -r requirements.txt --upgrade
	npx playwright install
	@echo "$(GREEN)✅ Dependencies updated.$(NC)"

##@ Utilities
logs: ## Show application logs
	@echo "$(BLUE)📋 Showing application logs...$(NC)"
	$(DOCKER_COMPOSE) logs -f

ps: ## Show running containers
	$(DOCKER_COMPOSE) ps

shell-frontend: ## Open shell in frontend container
	$(DOCKER_COMPOSE) exec frontend-dev sh

shell-backend: ## Open shell in backend container
	$(DOCKER_COMPOSE) exec backend-dev bash

health: ## Check application health
	@echo "$(BLUE)🏥 Checking application health...$(NC)"
	@curl -s http://localhost:8000/api/health || echo "$(RED)❌ Backend not responding$(NC)"
	@curl -s http://localhost:5173 >/dev/null && echo "$(GREEN)✅ Frontend responding$(NC)" || echo "$(RED)❌ Frontend not responding$(NC)"

##@ Documentation
docs: ## Generate and serve documentation
	@echo "$(BLUE)📚 Generating documentation...$(NC)"
	# Add documentation generation commands here
	@echo "$(YELLOW)⚠️  Documentation generation not configured yet.$(NC)"

##@ Git Workflow
git-setup: ## Setup git hooks and aliases
	@echo "$(BLUE)🔧 Setting up Git hooks...$(NC)"
	# Add git hook setup here
	git config core.hooksPath .githooks
	chmod +x .githooks/*
	@echo "$(GREEN)✅ Git hooks configured.$(NC)"

##@ Security
security-scan: ## Run security scans
	@echo "$(BLUE)🔒 Running security scans...$(NC)"
	npm audit
	cd backend && pip-audit
	@echo "$(GREEN)✅ Security scan complete.$(NC)"

##@ Performance
perf-test: ## Run performance tests
	@echo "$(BLUE)⚡ Running performance tests...$(NC)"
	npm run test:e2e -- performance.spec.ts
	@echo "$(GREEN)✅ Performance tests complete.$(NC)"

##@ Quick Commands
quick-start: install dev ## Quick start for new developers

quick-test: test-unit ## Quick test (unit tests only)

quick-check: lint quick-test ## Quick quality check
