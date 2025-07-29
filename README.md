# What's the Chance? 🎲

<div align="center">
  <img src="public/logo.png" alt="What's the Chance? Logo" width="200" height="200" />
</div>

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-0.0.4-000000?logo=shadcn)](https://ui.shadcn.com/)
[![Vitest](https://img.shields.io/badge/Vitest-1.0.0-6E9F18?logo=vitest)](https://vitest.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python)](https://www.python.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.7.1-FFCA28?logo=firebase)](https://firebase.google.com/)
[![Docker](https://img.shields.io/badge/Docker-3.8-2496ED?logo=docker)](https://www.docker.com/)
[![Traefik](https://img.shields.io/badge/Traefik-v3.0-24A1C1?logo=traefik)](https://traefik.io/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?logo=github-actions)](https://github.com/features/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/StavLobel/whats-the-chance-game/releases)
[![Security](https://img.shields.io/badge/Security-Scanned-brightgreen)](https://github.com/StavLobel/whats-the-chance-game/security)

The ultimate social game of chance and challenges! Dare your friends and see if fate is on your side.

> 🧪 **Development Approach: Test-Driven Development (TDD)**  
> This project follows strict TDD methodology with comprehensive testing using Vitest + React Testing Library (frontend) and Pytest + Playwright (backend).

> 🌿 **Git Workflow: Feature Branch + Test-Based Merging**  
> Each task uses a dedicated feature branch. Code is merged to main only after passing all tests (100% pass rate, 90%+ coverage) and code review approval.

> 🏭 **Industry Standards: Professional Configuration**  
> Complete with version management (SemVer), CI/CD pipeline, Docker containerization, code quality tools, and security scanning.

> 🔒 **Security First: Vulnerability Scanning**  
> Regular security audits with Bandit (Python) and npm audit (Node.js) to maintain secure codebase.

## 🎮 What is "What's the Chance?"

"What's the Chance?" is a real-time social game where players challenge each other with entertaining tasks. The twist? Whether you have to complete the challenge depends on a game of chance using number matching!

### 📋 Documentation

- **[Software Requirements Document (SRD)](./documentation/SRD.md)** - Complete technical specifications
- **[Development Tasks](./documentation/TASKS.md)** - Breakdown of major and minor development tasks
- **[Version Management](./documentation/VERSIONING.md)** - Semantic versioning and release process
- **[Changelog](./documentation/CHANGELOG.md)** - Complete version history and changes
- **[Cursor Rules](./.cursor/rules/)** - Development guidelines and coding standards
- **[Original Design Reference](https://lovable.dev/projects/246aae1e-8a6d-441f-b4ed-446405d5302c)** - Lovable project for visual reference

### How It Works

1. **Challenge**: One user poses a question: "What's the chance you'll do X?"
2. **Range**: The challenged user chooses a range (e.g., 1–10, 1–100)
3. **Guess**: Both users pick a number in that range
4. **Outcome**:
   - If the numbers match, the task must be performed
   - If not, the challenge is void

## 🚀 Features

- **Real-time Gameplay**: Live updates using Firebase Firestore
- **User Authentication**: Secure login with Firebase Auth
- **Push Notifications**: Instant challenge alerts via FCM
- **Responsive Design**: Works perfectly on all devices
- **Modern UI**: Beautiful interface with shadcn/ui components
- **Hebrew/RTL Support**: Hebrew text support for challenge descriptions with RTL layout
- **Dark Mode**: Complete theme system with light/dark/system options
- **Theme Toggle**: Accessible theme switcher on landing page and in-game
- **Offline Support**: Graceful handling of network issues

## 🛠️ Technology Stack

### Frontend

- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite 5** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful component library
- **Radix UI** - Accessible primitives
- **Lucide React** - Icon library
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing
- **Playwright** - End-to-end testing

### Backend

- **Python 3.9+** - Modern Python runtime
- **FastAPI** - High-performance web framework
- **Pydantic** - Data validation and settings
- **Firebase Admin SDK** - Backend Firebase integration
- **Firebase Firestore** - Real-time database
- **Firebase Cloud Messaging** - Push notifications
- **Pytest** - Testing framework
- **Playwright** - E2E testing
- **Allure Reports** - Test reporting
- **Bandit** - Security scanning

### DevOps & Quality

- **Docker** - Containerization
- **Traefik** - Reverse proxy with automatic SSL
- **GitHub Actions** - CI/CD pipeline
- **ESLint + Prettier** - Code formatting
- **Black + isort + mypy** - Python code quality
- **Husky + lint-staged** - Git hooks
- **Conventional Commits** - Standardized commit messages
- **Semantic Versioning** - Version management
- **Trivy** - Security scanning
- **npm audit** - Dependency vulnerability scanning

## 📦 Installation

### Prerequisites

- Node.js 18.0.0+
- Python 3.9+
- Docker (optional)
- Git

### Quick Start

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

4. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your Firebase configuration
   ```

5. **Start development servers**

   ```bash
   # Frontend (Terminal 1)
   npm run dev

   # Backend (Terminal 2)
   cd backend
   uvicorn app.main:app --reload
   ```

6. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 👥 Test Users

For development and testing purposes, the following dummy users are available in the Firebase database:

### User 1: John Doe

- **Email**: testuser1@example.com
- **Password**: TestPassword123!
- **Username**: johndoe
- **Full Name**: John Doe
- **UID**: 6Op1SrQJdyVpHAo419YyUwT9NOo2

### User 2: Jane Smith

- **Email**: testuser2@example.com
- **Password**: TestPassword123!
- **Username**: janesmith
- **Full Name**: Jane Smith
- **UID**: ZYWaZCihaeXcId5EW0ht2HAHTCq1

> **Note**: These are test users created specifically for development. They have full profiles with statistics and can be used to test all game features including challenge creation, acceptance, and number submission. For more details, see [TEST_USERS.md](./backend/TEST_USERS.md).

### Docker Development

```bash
# Start all services
docker-compose --profile dev up

# Or start individual services
docker-compose up frontend-dev
docker-compose up backend-dev
```

## 🧪 Testing

### Frontend Testing

```bash
# Unit tests
npm run test

# Unit tests with UI
npm run test:ui

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Backend Testing

```bash
cd backend

# Unit tests
pytest

# With coverage
pytest --cov=app --cov-report=html

# E2E tests
pytest tests/e2e/ --allure-results-dir=allure-results

# Security scanning
bandit -r app/
```

### Code Quality

```bash
# Frontend
npm run lint
npm run format
npm run type-check

# Backend
cd backend
black .
isort .
flake8 .
mypy .
bandit -r app/
```

### Security Audits

```bash
# Frontend security audit
npm audit

# Backend security audit
cd backend
bandit -r app/ -f json -o bandit-report.json
```

## 🚀 Deployment

### Production Build

```bash
# Frontend
npm run build

# Backend
cd backend
pip install -e .[prod]
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Docker Production

```bash
docker-compose --profile prod up -d
```

### Hostinger VPS Deployment

1. Set up Docker and Docker Compose
2. Configure environment variables
3. Set up Nginx reverse proxy
4. Configure SSL certificates
5. Deploy with `docker-compose --profile prod up -d`

## 📚 Development Guidelines

### Git Workflow

1. Create feature branch: `git checkout -b feature/issue-number-task-name`
2. Implement with TDD approach
3. Run all tests: `npm run test && cd backend && pytest`
4. Create Pull Request
5. Pass CI/CD checks
6. Code review approval
7. Merge to main

### Code Standards

- **Frontend**: ESLint + Prettier + TypeScript strict mode
- **Backend**: Black + isort + flake8 + mypy + Bandit
- **Commits**: Conventional Commits format
- **Testing**: 90%+ coverage required
- **Documentation**: Keep docs updated
- **Security**: Regular vulnerability scanning

### Version Management

- **Semantic Versioning**: MAJOR.MINOR.PATCH
- **Release Process**: Automated with GitHub Actions
- **Changelog**: Keep CHANGELOG.md updated
- **Tags**: Automatic version tagging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow TDD approach
4. Ensure all tests pass
5. Update documentation
6. Submit a Pull Request

### Development Setup

```bash
# Install pre-commit hooks
npm run prepare

# Backend pre-commit setup
cd backend
pre-commit install
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Repository**: https://github.com/StavLobel/whats-the-chance-game
- **Issues**: https://github.com/StavLobel/whats-the-chance-game/issues
- **Documentation**: [SRD.md](./SRD.md), [TASKS.md](./TASKS.md)
- **Version Guide**: [VERSIONING.md](./VERSIONING.md)
- **Changelog**: [CHANGELOG.md](./CHANGELOG.md)

## 🏗️ Project Status

**Current Version**: 0.1.0  
**Status**: Phase 2 Complete - Hebrew Support & Dark Mode Implemented  
**Next Milestone**: Remaining Frontend Core Features

## 🔒 Security Status

- **Frontend**: 7 vulnerabilities (1 low, 6 moderate) - Mostly in npm bundled dependencies
- **Backend**: Bandit security scanning configured
- **CI/CD**: Automated security scanning with Trivy
- **Dependencies**: Regular security audits and updates

---

**Built with ❤️ using modern web technologies and industry best practices**
