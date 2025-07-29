# Software Test Plan – "What's the Chance?" Game

## 1 Introduction

### 1.1 Purpose

This Software Test Plan (STP) describes the testing strategy and activities for the _What's the Chance?_ application. The goal of the project is to build a responsive, real-time social game using React, TypeScript, FastAPI, and Firebase that adheres to a strict Test-Driven Development (TDD) approach. The STP explains how testing will ensure correctness, security, and usability throughout the lifecycle.

### 1.2 Scope

Covers:

- Frontend (React): UI, components, modals, routing, i18n
- Backend (FastAPI): APIs, authentication, challenge resolution
- Integration: Firebase sync, notification handling
- End-to-End: Full user flow with test users and real-time game states

## 2 Test Strategy

### 2.1 Tools & Frameworks

- **Unit Testing**:
  - Frontend: Vitest + React Testing Library
  - Backend: Pytest
- **E2E Testing**: Playwright
- **Coverage Reports**: `vitest --coverage`, `pytest --cov`
- **Reports**: Allure
- **Security**: Bandit (backend), npm audit (frontend)
- **CI/CD**: GitHub Actions with test workflow and containerized execution

### 2.2 Test Environment

- Dev: Localhost (Frontend: 5173, Backend: 8000)
- CI: Docker + GitHub Actions
- Real-time DB: Firebase Firestore (test instance)
- Test users: pre-defined accounts for UI flows

## 3 Test Objectives

| Objective                 | Description                                        |
| ------------------------- | -------------------------------------------------- |
| Functional correctness    | Validate features match SRD and user flows         |
| Real-time interaction     | Ensure updates sync live via Firebase              |
| Security & access control | Prevent unauthorized access to user/challenge data |
| Responsive & RTL layout   | Proper rendering on devices and RTL support        |
| Notification reliability  | Push via FCM and UI badge updates                  |
| Coverage & regression     | Maintain 90%+ test coverage and detect regressions |

## 4 Test Suites

### 4.1 Frontend Unit Tests

| Suite          | Components Included                            |
| -------------- | ---------------------------------------------- |
| UI Components  | Buttons, Modals, Cards, Icons, Toasts          |
| Pages          | Home, Create, Notifications, Settings          |
| Auth Flow      | Login form, input validation, loading states   |
| Challenge Form | Range selector, description input, submit flow |
| Theme/Language | Dark mode toggle, Hebrew/English toggle        |

### 4.2 Backend Unit Tests

| Suite           | Modules                                       |
| --------------- | --------------------------------------------- |
| Auth            | Token verification, Firebase claims           |
| API Endpoints   | `/challenge`, `/notification`, `/user` routes |
| Validation      | Pydantic models, input ranges, formats        |
| Firestore Logic | Challenge document lifecycle, status updates  |

### 4.3 Integration Tests

| Scenario              | Coverage                                   |
| --------------------- | ------------------------------------------ |
| Challenge lifecycle   | Create → Accept → Resolve → Match/No Match |
| Notification dispatch | FCM delivery and Firebase writeback        |
| User login            | Firebase Auth → session token              |
| Challenge sync        | Real-time snapshot listeners               |

### 4.4 E2E Tests with Playwright

| ID     | Title                       | Steps                                                            |
| ------ | --------------------------- | ---------------------------------------------------------------- |
| E2E-01 | Login with test user        | Visit `/login`, enter test credentials, assert dashboard load    |
| E2E-02 | Create & resolve challenge  | User1 creates → User2 accepts → numbers picked → result asserted |
| E2E-03 | Notification badge & toast  | Trigger event → assert bell count + in-app toast shows           |
| E2E-04 | Language switch & RTL check | Toggle language → verify layout direction and content update     |
| E2E-05 | Theme switch                | Toggle theme → verify class applied and persisted                |

## 5 Test Cases

Here are examples from various categories:

### ✅ Frontend Unit

| ID   | Title                       | Description                                   |
| ---- | --------------------------- | --------------------------------------------- |
| F-01 | Modal opens on click        | Assert modal state changes after button press |
| F-02 | Form validation shows error | Leave range empty and check for message       |
| F-03 | RTL layout works for Hebrew | Switch to Hebrew and check CSS direction      |

### 🧪 Backend Unit

| ID   | Title                    | Description                           |
| ---- | ------------------------ | ------------------------------------- |
| B-01 | Validate number range    | Ensure 1 ≤ range ≤ 100                |
| B-02 | Resolve logic (match)    | Both numbers same → return `match`    |
| B-03 | Resolve logic (no match) | Numbers differ → return `no_match`    |
| B-04 | Auth required            | Call route without token → return 401 |

### 🎯 Integration

| ID   | Title                        | Description                                   |
| ---- | ---------------------------- | --------------------------------------------- |
| I-01 | Challenge creation & sync    | Create → other user receives instantly via DB |
| I-02 | Push notification delivered  | Trigger FCM and check it reaches user         |
| I-03 | Challenge read only by owner | Logged-in user can’t access others' challenge |

### 🌐 E2E Playwright

| ID     | Title                      | Description                                    |
| ------ | -------------------------- | ---------------------------------------------- |
| E2E-06 | Retry logic on failed FCM  | Simulate offline → retry queue on reconnection |
| E2E-07 | Session persists on reload | Reload app → user still logged in              |
| E2E-08 | Firebase write blocked     | User writes forbidden path → assert 403        |

## 6 Coverage Targets

- Frontend: 90% line and branch coverage via Vitest
- Backend: 90% via Pytest with `--cov=app`
- Full E2E flow: Minimum 5 high-confidence user paths
- Coverage reports published via Allure in CI/CD pipeline

## 7 Security & Audit Tests

| Tool      | Purpose                      |
| --------- | ---------------------------- |
| Bandit    | Python backend scan          |
| npm audit | Frontend dependency scan     |
| Trivy     | Docker image vulnerabilities |

## 8 Automation & CI/CD

- Tests run on every PR via GitHub Actions
- Allure Reports are published as build artifacts and GitHub Pages
- Pre-commit hooks run unit/lint tests

## 9 Acceptance Criteria

- All tests must pass (unit + E2E)
- ≥90% test coverage
- No high-severity vulnerabilities
- Manual test run log for final milestone
