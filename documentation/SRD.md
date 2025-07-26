# Software Requirements Document (SRD) – "What's the Chance?" App (Full System)

> ⚙️ **Development Approach: Test-Driven Development (TDD)**  
> This project is developed using a TDD approach. Each feature starts with writing unit/integration tests (using tools like Vitest or Pytest + Playwright), followed by implementation, and only then refactoring. This ensures robust, predictable, and maintainable code.

## 🧭 Overview

"What's the Chance?" is a real-time social game where users challenge each other to complete funny or outrageous tasks — but whether they follow through depends on luck. The game revolves around number guessing: if two users choose the same number in a defined range, the challenge must be completed.

This SRD includes specifications for the frontend and backend, outlines the use of Firebase and Python, and details deployment via a Hostinger VPS.

### 📋 **Design Reference**

- **Original Implementation**: [Lovable Project](https://lovable.dev/projects/246aae1e-8a6d-441f-b4ed-446405d5302c)
- **Purpose**: Reference for UI/UX design, layout, and user experience
- **Status**: Existing implementation provides foundation for development

---

## 🎮 Game Rules

1. **Challenge**: One user poses a question: "What's the chance you'll do X?"
2. **Range**: The challenged user chooses a range (e.g., 1–10, 1–100).
3. **Guess**: Both users pick a number in that range.
4. **Outcome**:
   - If the numbers match, the task must be performed.
   - If not, the challenge is void.

---

## 🖼️ UI/UX Requirements

- Fully **responsive design** (mobile-first)
- **Modern visuals** using shadcn/ui and Tailwind CSS
- **Classic menu drawer** with:
  - Home
  - My Challenges
  - Create Challenge
  - Notifications (with badge count)
  - Settings
- Light/dark mode support
- Smooth modal animations and transitions
- Notification bell icon in the top navbar

---

## 🧪 Testing Requirements

- Use **Vitest** + **React Testing Library** for frontend unit tests
- Use **Pytest** + **Playwright** for backend and full E2E test coverage
- Generate **Allure Reports** for each test run to track results and regressions
- Run all tests inside Docker during CI with GitHub Actions
- Aim for 90%+ code coverage
- E2E scenarios:
  - User registration/login flow
  - Creating and resolving challenges
  - Notification delivery and response
  - Real-time updates

---

## 🧩 Core Features

### Authentication

- Firebase Authentication (Google, email/password)
- Session persistence
- Show user avatars/usernames in challenges

### Challenge Flow

- User creates a challenge and tags another
- Challenged user receives notification
- Accept challenge → set range → both pick numbers
- Backend checks for match and updates Firebase
- Users receive results in real-time

### Notifications

- New challenge received
- Challenge accepted
- Challenge resolved (match or no match)
- Firebase Cloud Messaging (FCM) integration

### Realtime Sync

- Firebase Firestore for live updates
- Snapshot listeners for user-specific challenge status

---

## 📦 Technology Stack

### Frontend

- React 18, TypeScript
- Tailwind CSS, shadcn/ui
- Radix UI, Lucide icons
- React Router
- Vitest + Testing Library

### Backend

- Python (FastAPI)
- Pytest + Playwright (integration & E2E tests)
- Allure Reports (HTML + CI reports)
- Firebase Admin SDK
- Firebase Firestore
- Firebase FCM
- RESTful API (hosted on Hostinger VPS)
- Secure with Firebase Auth tokens

---

## 📡 API Endpoints

- `POST /challenge/resolve`
- `GET /user/{id}/challenges`
- `POST /notification/send`
- `GET /challenge/{id}`
- `POST /challenge/{id}/respond`

---

## 🔐 Security

- Token validation middleware on all protected routes
- User data scoped to authenticated session
- Firestore rules configured to prevent unauthorized reads/writes

---

## 📁 Directory Structure (Frontend)

```
src/
├── components/          # Reusable components
│   └── ui/              # shadcn/ui-based elements
├── hooks/               # React custom hooks
├── pages/               # Route pages (Home, Create, View)
├── lib/                 # Utilities and Firebase logic
├── types/               # TypeScript types
├── data/                # Mock data for development
├── tests/               # Unit + E2E tests (vitest/playwright)
```

---

## 📁 Directory Structure (Backend)

```
backend/
├── app/                 # FastAPI app modules
├── tests/               # Pytest + Playwright tests
├── reports/             # Allure result files
├── Dockerfile           # Production container
├── entrypoint.sh        # Deployment entry
├── main.py              # App entrypoint
```

---

## 🧱 Data Models

### User

- `id`, `username`, `email`, `avatar`, `auth_provider`, `created_at`

### Challenge

- `id`, `from_user`, `to_user`, `description`, `range`, `from_number`, `to_number`, `status`, `result`, `created_at`

### Notification

- `id`, `user_id`, `challenge_id`, `type`, `read`, `created_at`

---

## 🚀 Deployment (Hostinger VPS)

- Docker Compose setup for frontend and FastAPI backend
- Nginx reverse proxy + HTTPS certificate
- Firebase API keys stored securely in `.env`
- GitHub Actions CI/CD to:
  - Run tests with Allure
  - Build & deploy containers
  - Publish Allure reports to GitHub Pages or S3

---

## 📈 Future Features

- Anonymous mode
- Challenge history/log
- Reactions and comments
- Group challenge support
- Leaderboard
