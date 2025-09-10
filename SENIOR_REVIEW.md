# Senior Review: whats-the-chance-game

The repository is a well-structured monorepo for a real-time Hebrew social game.  
The README explains that users challenge each other with tasks and a number-matching mechanic determines whether the task must be completed.  

The game is implemented with:
- **Front-end:** React/TypeScript  
- **Back-end:** FastAPI (Python)  
- **Auth & Data:** Firebase Auth and Firestore for real-time data and notifications  
- **CI/CD & Tooling:** TDD, comprehensive tests, GitHub Actions, Docker/Traefik, Bandit, npm audit  
- **Documentation:** SRD, versioning, tasks breakdown  

---

## Strengths

- **Clear monorepo structure:**  
  Separate `src` for the front-end and `backend` for the server, plus scripts, documentation, and CI configuration.

- **Comprehensive tooling:**  
  React 18 + Vite + shadcn/ui on the front-end; FastAPI + Pydantic on the back-end; Firebase for auth and persistence; Docker/Traefik, GitHub Actions, Bandit and npm audit for DevOps.

- **Testing culture:**  
  TDD is explicitly adopted, with Vitest/React Testing Library for unit tests, Pytest and Playwright for backend and end-to-end tests.

- **Documentation:**  
  A detailed README, SRD, and tasks breakdown help new contributors understand the project and maintain it.

---

## Opportunities for Improvement

- **Separation of concerns and OOP:**  
  Create a domain layer (pure TypeScript classes/functions), an application layer (React Query hooks and mappers), and infrastructure adapters (Firebase, local storage). This will decouple the UI from Firebase and align with SOLID principles.

- **Repository and service patterns:**  
  Introduce interfaces (`IUserRepository`, `IChallengeRepository`, etc.) with Firebase or in-memory implementations.  
  On the server: organise code into `routers → services → repositories` with clear DI (FastAPI's `Depends`).

- **Validation and schema enforcement:**  
  Use **Zod** (front-end) and **Pydantic** (back-end) to validate all external data before it enters domain logic.

- **State and auth handling:**  
  Centralise auth routing logic (AuthGate, ProtectedRoute).  
  Abstract browser storage to avoid localStorage errors in E2E tests. Provide a MemoryStorage implementation for tests.

- **Security and test data:**  
  Remove exposed test user credentials from README (move to separate doc or seeding script).  
  Tighten Firestore rules (restrict to authorised users) and add emulator tests.  
  Integrate weekly dependency update workflows.

- **Observability and error handling:**  
  Add error boundaries in React, structured logging in FastAPI, and minimal audit logging for sensitive actions.

---

## Comprehensive Cursor Prompt

**System goal:** Refactor `whats-the-chance-game` towards a clean architecture adhering to OOP/SOLID, while fixing auth and testing issues and maintaining existing functionality.

**Ground rules:**
- Behaviour must remain consistent for users; introduce incremental PRs.
- Use SOLID principles: SRP, OCP, LSP, ISP, DIP.
- All external data must be validated before entering domain logic.
- Firebase should only be used in infrastructure adapters; UI and domain code must not depend on Firebase SDK.
- Update documentation as the architecture evolves.

---

## Tasks

### 1. Frontend layering & DI
- Create `src/domain` with models (`User`, `Challenge`), usecases, and ports (`IAuthRepository`, `IUserRepository`, `IChallengeRepository`, `IStorage`).
- Create `src/infrastructure` with Firebase adapters + storage (`LocalStorageImpl`, `MemoryStorageImpl`).
- Create `src/application` with React Query hooks orchestrating usecases and mapping Firestore docs.
- Move Firebase calls into infrastructure; UI only uses hooks/usecases.
- Implement `AuthGate`, `ProtectedRoute`, error boundary, and global error-toast.

### 2. Backend layering
- Organise `backend/app` into routers, services, repositories, schemas, domain.
- Define repository interfaces and Firebase adapters.
- Use FastAPI `Depends` for DI.  
- Ensure endpoints use Pydantic models for input/output.

### 3. Storage abstraction for tests
- Introduce `IStorage` interface with `LocalStorageImpl` (prod) and `MemoryStorageImpl` (tests).
- Update Playwright/Vitest to inject MemoryStorage in E2E tests.

### 4. Data validation
- Use **zod** (front-end) and **Pydantic** (back-end).
- Reject invalid data before domain usecases.

### 5. Security
- Move test credentials out of README into `TEST_USERS.md` or seeding scripts.
- Tighten Firestore rules to user-scoped reads/writes.
- Add Firebase Emulator rule tests in CI.
- Add weekly workflows for `npm audit` and `bandit`.

### 6. Testing strategy
- **Front-end:**  
  Unit tests for usecases, integration tests for hooks with mocked repos, component tests (RTL), E2E (Playwright).
- **Back-end:**  
  Unit tests for services with fake repos, integration with Firebase emulator, E2E API tests with Allure.
- Enforce coverage thresholds (85%+).

### 7. CI/CD & docs
- Update GitHub Actions: separate jobs for FE/BE, run tests, coverage reports, Allure reports.
- Add Trivy scans for Docker images, auto dependency updates.
- Update `README.md`, add `ARCHITECTURE.md`.

---

## Checklist Summary

- [ ] Introduced domain/usecase/ports layers and adapters in the front-end.  
- [ ] Added DI and AuthGate/ProtectedRoute; removed direct Firebase calls.  
- [ ] Structured back-end into routers, services, repositories, domain models with DI.  
- [ ] Added IStorage abstraction and test storage for Playwright.  
- [ ] Validated external data via zod/Pydantic.  
- [ ] Hardened Firestore rules and removed test credentials from README.  
- [ ] Enhanced CI/CD with security scans, coverage gates, Allure.  
- [ ] Updated documentation and added architecture overview.  

---

**Outcome:**  
These changes will improve **modularity, testability, and maintainability** of the project, allowing the game to evolve more safely and efficiently.
