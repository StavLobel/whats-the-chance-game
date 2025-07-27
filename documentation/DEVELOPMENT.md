# Development Environment Setup

Welcome to the "What's the Chance?" development environment! This guide will help you set up your local development environment and understand the project structure.

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Python** >= 3.9
- **Git** (latest version)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/StavLobel/whats-the-chance-game.git
   cd whats-the-chance-game
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Install backend dependencies**

   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

4. **Set up pre-commit hooks**
   ```bash
   npm run prepare
   ```

## 📁 Project Structure

### Frontend Structure

```
src/
├── components/          # Reusable React components
│   └── ui/             # shadcn/ui base components
├── hooks/              # Custom React hooks
├── pages/              # Route pages (Home, Create, View)
├── lib/                # Utilities and Firebase logic
├── types/              # TypeScript type definitions
├── data/               # Mock data for development
└── test/               # Unit tests and test utilities
```

### Backend Structure

```
backend/
├── app/                # FastAPI application modules
│   ├── routers/        # API route definitions
│   ├── models/         # Database models
│   ├── schemas/        # Pydantic schemas
│   ├── services/       # Business logic
│   └── core/           # Core configuration
├── tests/              # Pytest tests
├── reports/            # Allure test reports
├── Dockerfile          # Production container
├── entrypoint.sh       # Deployment script
└── main.py             # Application entrypoint
```

### Testing Structure

```
tests/e2e/              # Playwright E2E tests
├── pages/              # Page object models
├── utils/              # Test utilities
└── fixtures/           # Test fixtures
```

## 🧪 Testing

### Frontend Testing

**Unit Tests (Vitest + React Testing Library)**

```bash
npm test                # Run tests in watch mode
npm run test:coverage   # Run with coverage report
npm run test:ui         # Run with UI dashboard
```

**E2E Tests (Playwright)**

```bash
npm run test:e2e        # Run E2E tests
npm run test:e2e:headed # Run with browser visible
npm run test:e2e:debug  # Run in debug mode
```

### Backend Testing

**Unit Tests (Pytest)**

```bash
cd backend
python -m pytest tests/unit/ -v
```

**With Coverage and Allure Reports**

```bash
python -m pytest tests/unit/ -v --cov=app --alluredir=allure-results
```

**Integration Tests**

```bash
python -m pytest tests/integration/ -v
```

### Test Reports

**Generate Allure Reports**

```bash
# Frontend
npm run allure:generate
npm run allure:open

# Backend
cd backend
allure generate allure-results --clean -o allure-report
allure open allure-report
```

## 🔧 Development Workflow

### Git Workflow

1. **Create feature branch**

   ```bash
   git checkout -b feature/issue-number-task-name
   ```

2. **Make changes and test**

   ```bash
   npm test               # Frontend tests
   cd backend && python -m pytest  # Backend tests
   ```

3. **Commit changes**

   ```bash
   git add .
   git commit -m "feat: description of changes"
   # Pre-commit hooks will run automatically
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/issue-number-task-name
   # Create pull request on GitHub
   ```

### Code Quality

**Linting and Formatting**

```bash
# Frontend
npm run lint            # Check for issues
npm run lint:fix        # Fix issues automatically
npm run format          # Format code with Prettier

# Backend
cd backend
black .                 # Format Python code
isort .                 # Sort imports
flake8 .               # Check for issues
mypy .                 # Type checking
```

**Pre-commit Hooks**

- Automatically run on every commit
- Lint and format frontend code
- Run Python code quality checks
- Prevent commits with issues

## 🏃‍♂️ Running the Application

### Development Mode

**Frontend (Vite)**

```bash
npm run dev
# Runs on http://localhost:8080
```

**Backend (FastAPI)**

```bash
cd backend
python main.py
# Runs on http://localhost:8000
# API docs: http://localhost:8000/api/docs
```

### Production Mode (Docker)

**Build and run with Docker Compose**

```bash
docker-compose up --build
```

## 🎯 Development Guidelines

### Test-Driven Development (TDD)

1. **Red**: Write a failing test first
2. **Green**: Write minimal code to make it pass
3. **Refactor**: Improve code while keeping tests green

### Cursor AI Rules

The project includes comprehensive Cursor rules in `.cursor/rules/`:

- **TDD Approach**: Guidelines for test-driven development
- **Frontend Components**: React/TypeScript best practices
- **Backend API**: FastAPI development standards
- **Project Structure**: File organization guidelines
- **Git Workflow**: Branch management and quality gates
- **Issue Tracking**: GitHub issue management

### Code Standards

**Frontend**

- TypeScript for all components
- Functional components with hooks
- Tailwind CSS for styling
- shadcn/ui for base components

**Backend**

- Python 3.9+ with type hints
- FastAPI for API development
- Pydantic for data validation
- Firebase for authentication and database

## 🐛 Troubleshooting

### Common Issues

**ESLint errors**

```bash
npm run lint:fix
```

**Python import errors**

```bash
cd backend
pip install -r requirements.txt
```

**Pre-commit hook failures**

```bash
npm run lint:fix
npm run format
git add .
git commit -m "fix: resolve pre-commit issues"
```

**Test failures**

```bash
# Clear test cache
rm -rf node_modules/.cache
npm test

# Backend test issues
cd backend
python -m pytest --cache-clear
```

### Getting Help

1. Check this documentation
2. Review the SRD: `documentation/SRD.md`
3. Check project tasks: `documentation/TASKS.md`
4. Look at existing tests for examples
5. Use Cursor AI rules for guidance

## 📚 Additional Resources

- **Project Documentation**: `documentation/`
- **Software Requirements**: `documentation/SRD.md`
- **Task Breakdown**: `documentation/TASKS.md`
- **Version Management**: `documentation/VERSIONING.md`
- **Change Log**: `documentation/CHANGELOG.md`
- **API Documentation**: http://localhost:8000/api/docs (when backend is running)
- **Test Reports**: Generated in `allure-report/` directories

---

**Happy coding! 🎮**

_For questions or issues, please check the GitHub issues or create a new one._
