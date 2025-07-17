# Project Tasks Breakdown for "What's the Chance?"

## 1. Major Tasks (Epics)

### 1.1. Project Setup & Infrastructure
- Set up GitHub repository and branching strategy ✅
- Set up CI/CD with GitHub Actions (including Black, Bandit, build, deploy) ✅
- **Next:** Dockerize backend (FastAPI) and frontend (Flutter web)
- **Next:** Set up Hostinger server for deployment
- **Next:** Configure deployment scripts and secrets (SSH/SCP/rsync)
- **Next:** Test local builds and deployment pipeline
- Configure Firebase (Firestore, Realtime DB, Cloud Functions)

### 1.2. Backend Development (FastAPI)
- User management (registration, login, profile)
- Mission management (CRUD, statuses, appeals, cancellation)
- Real-time notification endpoints
- Security (authentication, password encryption, data protection)
- Integration with Firebase (Firestore, Realtime DB, Cloud Functions)
- Error handling and logging

### 1.3. Frontend Development (Flutter)
- User registration/login screens (Hebrew, RTL)
- User profile screen
- Challenge board (mission list, statuses, color coding, RTL)
- Mission creation form (Hebrew input, user tagging)
- Mission response screens (accept/decline, range selection, number input)
- Appeal mechanism (appeal button, appeal count, auto-close)
- Notification UI (real-time, Hebrew, RTL)
- Results display (numbers, status, color coding)
- Full Hebrew i18n and RTL support

### 1.4. Design (Figma)
- Wireframes, mockups, and prototypes for all screens
- RTL and Hebrew typography considerations

### 1.5. Testing & Quality Assurance
- Unit and integration tests (backend and frontend)
- Security testing (Bandit)
- Code formatting (Black)
- Usability testing (Hebrew, RTL, non-technical users)

---

## 2. Minor Tasks (User Stories/Features)

### Backend
- Store and retrieve user data in Firestore
- Store and update mission data, including statuses and appeals
- Implement real-time notification triggers (Cloud Functions)
- Enforce appeal limits and auto-close missions
- Secure secret numbers until mission completion
- Provide endpoints for all frontend needs

### Frontend
- Support Hebrew input in all fields
- Display all statuses in Hebrew, with correct color coding
- Handle all mission flows (creation, acceptance, appeal, completion)
- Show real-time updates and notifications
- Responsive design for web and mobile

### DevOps
- Automate deployment to Hostinger
- Monitor and log errors

---

## 3. Clarification Questions

1. **User Registration:**
   - Is email required, or just username and password?
   - Any password complexity requirements?
   - Is there a need for email verification or password reset?

2. **User Tagging:**
   - Can Player A challenge any registered user, or only users they know (friends list)?

3. **Mission Data:**
   - Is there a limit to the number of active missions per user?
   - Should missions be archived after completion/cancellation?

4. **Notifications:**
   - Should notifications be in-app only, or also via email/push?

5. **Security:**
   - Should we use Firebase Authentication, or custom auth in FastAPI?
   - Any requirements for GDPR or data privacy compliance?

6. **Design:**
   - Will Figma designs be provided before development, or do we need to create them?

7. **Deployment:**
   - Is Docker required for deployment, or is a simple Python/Flutter build sufficient?

8. **Testing:**
   - Any specific test coverage requirements (e.g., 80%+)?

9. **Languages:**
   - Is there any need for English fallback, or is Hebrew-only sufficient?

10. **Mobile:**
    - Is mobile web support sufficient, or do you want native mobile apps as well? 