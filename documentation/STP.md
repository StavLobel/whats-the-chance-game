# Software Test Plan – "What's the Chance?" Game

## 1 Introduction

### 1.1 Purpose

This Software Test Plan (STP) describes the testing strategy and activities for the _What's the Chance?_ application. The goal of the project is to build a responsive, real-time social game using React, TypeScript, FastAPI, and Firebase that adheres to a strict Test-Driven Development (TDD) approach. The STP explains how testing will ensure correctness, security, and usability throughout the lifecycle.

### 1.2 Scope

Covers:

- Frontend (React): UI, components, modals, routing, i18n
- Backend (FastAPI): APIs, authentication, challenge resolution
- Integration: Firebase sync, notification handling
- End-to-End: Full user flow with test users and real-time game states

## 2 Test Strategy

### 2.1 Tools & Frameworks

- **Unit Testing**:
  - Frontend: Vitest + React Testing Library
  - Backend: Pytest + Allure
- **E2E Testing**: Playwright
- **Coverage Reports**: `vitest --coverage`, `pytest --cov`
- **Reports**: Allure
- **Security**: Bandit (backend), npm audit (frontend)
- **CI/CD**: GitHub Actions with test workflow and containerized execution

### 2.2 Test Environment

- Dev: Localhost (Frontend: 5173, Backend: 8000)
- CI: Docker + GitHub Actions
- Real-time DB: Firebase Firestore (test instance)
- Test users: pre-defined accounts for UI flows

## 3 Test Objectives

| Objective                 | Description                                        |
| ------------------------- | -------------------------------------------------- |
| Functional correctness    | Validate features match SRD and user flows         |
| Real-time interaction     | Ensure updates sync live via Firebase              |
| Security & access control | Prevent unauthorized access to user/challenge data |
| Responsive & RTL layout   | Proper rendering on devices and RTL support        |
| Notification reliability  | Push via FCM and UI badge updates                  |
| Coverage & regression     | Maintain 90%+ test coverage and detect regressions |

## 4 Test Suites

### 4.1 Frontend Unit Tests

| Suite          | Components Included                            | Test Files |
| -------------- | ---------------------------------------------- | ---------- |
| UI Components  | Buttons, Modals, Cards, Icons, Toasts          | `src/test/components/` |
| API Services   | Friend ID API, Unique ID API, Game Service     | `src/lib/__tests__/` |
| Hooks          | useFriendId, useAuth, useGame                  | `src/hooks/__tests__/` |
| Utils          | Game utilities, validation helpers             | `src/test/utils/` |
| Realtime       | WebSocket connections, Firebase sync           | `src/test/realtime.test.ts` |

### 4.2 Backend Unit Tests

| Suite           | Modules                                       | Test Files |
| --------------- | --------------------------------------------- | ---------- |
| Models          | User, Challenge, GameSession validation       | `backend/tests/unit/test_models.py` |
| Validation      | Pydantic models, input ranges, formats        | `backend/tests/unit/test_challenge_validation.py` |
| API Services    | Friend ID API, Game stats, Firebase service   | `backend/tests/unit/test_friend_id_api.py` |
| Firebase        | Firestore operations, authentication          | `backend/tests/unit/test_firebase_service.py` |
| Game Logic      | Challenge resolution, number matching         | `backend/tests/unit/test_game_stats.py` |

### 4.3 Integration Tests

| Scenario              | Coverage                                   | Test Files |
| --------------------- | ------------------------------------------ | ---------- |
| API Integration       | Frontend-backend API communication        | `src/lib/__tests__/*.integration.test.ts` |
| Friend ID Workflow    | Complete friend ID generation and lookup   | `src/lib/__tests__/friendIdApiService.integration.test.ts` |
| Game Service          | Challenge creation and resolution flow     | `src/test/game-service.test.ts` |
| Real-time Features    | WebSocket connections and live updates     | `src/test/realtime.test.ts` |

### 4.4 E2E Tests with Playwright

| ID     | Title                       | Test File | Coverage |
| ------ | --------------------------- | --------- | -------- |
| E2E-01 | Authentication Flow         | `tests/e2e/auth.spec.ts` | Login, signup, logout |
| E2E-02 | Game Flow Complete          | `tests/e2e/game-flow.spec.ts` | Full challenge lifecycle |
| E2E-03 | Friend Request Flow         | `tests/e2e/friend-request-flow.spec.ts` | Send, accept, verify |
| E2E-04 | Friend ID Workflow          | `tests/e2e/friend-id-workflow.spec.ts` | Generate, share, lookup |
| E2E-05 | Friends Management          | `tests/e2e/friends-flow.spec.ts` | Add, remove, list friends |
| E2E-06 | UI Features                 | `tests/e2e/ui-features.spec.ts` | Theme, language, responsive |
| E2E-07 | Error Handling              | `tests/e2e/error-handling.spec.ts` | Network errors, validation |
| E2E-08 | Performance                 | `tests/e2e/performance.spec.ts` | Load times, responsiveness |
| E2E-09 | Health Check                | `tests/e2e/health-check.spec.ts` | API endpoints, connectivity |

## 5 Test Cases

### 5.1 Frontend Unit Tests

#### F-01: Friend ID API Service Tests
**File**: `src/lib/__tests__/friendIdApiService.test.ts`

**Test Steps**:
1. **Setup**: Mock API module with vi.mock()
2. **Test validateFriendId()**: 
   - Call with valid friend ID format
   - Verify API call to `/api/friends/friend-id/validate/{friendId}`
   - Assert response data structure
3. **Test lookupUserByFriendId()**:
   - Call with existing friend ID
   - Verify API call to `/api/friends/friend-id/lookup/{friendId}`
   - Assert user data returned
4. **Test getMyFriendId()**:
   - Call without parameters
   - Verify API call to `/api/friends/unique-id/my`
   - Assert friend ID and message returned
5. **Test generateFriendId()**:
   - Call to generate new friend ID
   - Verify API call to `/api/friends/unique-id/generate`
   - Assert new friend ID created

#### F-02: Friend ID Integration Tests
**File**: `src/lib/__tests__/friendIdApiService.integration.test.ts`

**Test Steps**:
1. **Setup**: Mock API to return raw JSON (not wrapped in { data })
2. **Test getMyFriendId with raw JSON**:
   - Mock backend response: `{ unique_id: '1234567890123456', message: 'Existing Friend ID retrieved' }`
   - Call service method
   - Verify response mapping from `unique_id` to `friend_id`
3. **Test generateFriendId with raw JSON**:
   - Mock backend response: `{ unique_id: '9876543210987654', message: 'Friend ID generated successfully' }`
   - Call service method
   - Verify response mapping and API call

#### F-03: useFriendId Hook Tests
**File**: `src/hooks/__tests__/useFriendId.test.ts`

**Test Steps**:
1. **Setup**: Mock friendIdApiService and render hook
2. **Test initial state**:
   - Verify loading state is true initially
   - Verify friendId is null initially
3. **Test successful friend ID fetch**:
   - Mock successful API response
   - Verify loading becomes false
   - Verify friendId is set correctly
4. **Test error handling**:
   - Mock API error
   - Verify error state is set
   - Verify loading becomes false

#### F-04: Game Service Tests
**File**: `src/test/game-service.test.ts`

**Test Steps**:
1. **Setup**: Mock Firebase and API dependencies
2. **Test createChallenge()**:
   - Call with valid challenge data
   - Verify Firebase document creation
   - Assert challenge ID returned
3. **Test acceptChallenge()**:
   - Call with challenge ID and user number
   - Verify Firebase document update
   - Assert challenge status changed
4. **Test resolveChallenge()**:
   - Call with challenge ID
   - Verify number matching logic
   - Assert correct result (match/no match)

#### F-05: Game Utils Tests
**File**: `src/test/utils/game-utils.test.ts`

**Test Steps**:
1. **Test number validation**:
   - Test valid numbers (1-100)
   - Test invalid numbers (0, negative, >100)
   - Test non-numeric inputs
2. **Test challenge validation**:
   - Test valid challenge descriptions
   - Test empty descriptions
   - Test description length limits
3. **Test result calculation**:
   - Test matching numbers
   - Test non-matching numbers
   - Test edge cases

#### F-06: Realtime Connection Tests
**File**: `src/test/realtime.test.ts`

**Test Steps**:
1. **Setup**: Mock WebSocket and Firebase connections
2. **Test connection establishment**:
   - Verify WebSocket connection opened
   - Verify Firebase listener attached
3. **Test message handling**:
   - Simulate incoming WebSocket message
   - Verify message processing
   - Verify UI update triggered
4. **Test disconnection handling**:
   - Simulate connection loss
   - Verify reconnection attempt
   - Verify error handling

### 5.2 Backend Unit Tests

#### B-01: User Model Tests
**File**: `backend/tests/unit/test_models.py`

**Test Steps**:
1. **Test create_user_with_valid_data()**:
   - Create user with valid data structure
   - Verify all required fields are set
   - Assert user attributes match input data
2. **Test user_email_validation()**:
   - Test valid email formats
   - Test invalid email formats
   - Verify validation error messages
3. **Test user_display_name_validation()**:
   - Test valid display names
   - Test empty display names
   - Test display name length limits
4. **Test user_creation_timestamp()**:
   - Verify created_at timestamp is set
   - Verify timestamp is recent
   - Test timestamp format

#### B-02: Challenge Validation Tests
**File**: `backend/tests/unit/test_challenge_validation.py`

**Test Steps**:
1. **Test valid_challenge_creation()**:
   - Create challenge with valid data
   - Verify all fields are properly set
   - Assert challenge object creation
2. **Test description_validation_required()**:
   - Attempt to create challenge without description
   - Verify ValidationError is raised
   - Check error message content
3. **Test description_validation_length()**:
   - Test description length limits
   - Test empty descriptions
   - Test very long descriptions
4. **Test user_id_validation()**:
   - Test valid user IDs
   - Test invalid user ID formats
   - Test missing user IDs

#### B-03: Friend ID API Tests
**File**: `backend/tests/unit/test_friend_id_api.py`

**Test Steps**:
1. **Test generate_friend_id()**:
   - Call API endpoint
   - Verify unique ID generation
   - Assert response format
2. **Test validate_friend_id()**:
   - Test with valid friend ID
   - Test with invalid friend ID
   - Verify validation response
3. **Test lookup_user_by_friend_id()**:
   - Test with existing friend ID
   - Test with non-existent friend ID
   - Verify user data returned

#### B-04: Firebase Service Tests
**File**: `backend/tests/unit/test_firebase_service.py`

**Test Steps**:
1. **Test firebase_connection()**:
   - Verify Firebase client initialization
   - Test database connection
   - Verify authentication
2. **Test document_operations()**:
   - Test document creation
   - Test document reading
   - Test document updating
   - Test document deletion
3. **Test query_operations()**:
   - Test simple queries
   - Test filtered queries
   - Test pagination
   - Test error handling

#### B-05: Game Stats Tests
**File**: `backend/tests/unit/test_game_stats.py`

**Test Steps**:
1. **Test calculate_win_rate()**:
   - Test with various win/loss ratios
   - Test edge cases (0 wins, 0 losses)
   - Verify percentage calculation
2. **Test calculate_streak()**:
   - Test winning streaks
   - Test losing streaks
   - Test streak reset logic
3. **Test aggregate_stats()**:
   - Test stat aggregation from multiple games
   - Test stat updates
   - Verify data consistency

### 5.3 Integration Tests

#### I-01: Friend ID API Integration
**File**: `src/lib/__tests__/friendIdApiService.integration.test.ts`

**Test Steps**:
1. **Setup**: Mock API responses with raw JSON format
2. **Test complete friend ID workflow**:
   - Generate new friend ID
   - Validate generated friend ID
   - Lookup user by friend ID
   - Verify end-to-end data flow
3. **Test error scenarios**:
   - Test network errors
   - Test invalid responses
   - Test timeout handling

#### I-02: Game Service Integration
**File**: `src/test/game-service.test.ts`

**Test Steps**:
1. **Setup**: Mock Firebase and API services
2. **Test complete challenge lifecycle**:
   - Create challenge
   - Accept challenge
   - Resolve challenge
   - Verify all steps work together
3. **Test real-time updates**:
   - Simulate Firebase updates
   - Verify UI updates
   - Test WebSocket notifications

### 5.4 E2E Tests

#### E2E-01: Authentication Flow
**File**: `tests/e2e/auth.spec.ts`

**Test Steps**:
1. **Test user signup**:
   - Navigate to login page
   - Click "Sign Up" tab
   - Fill in valid user details (email, password, display name)
   - Submit form
   - Verify user is logged in
   - Verify user avatar shows first letter of name
2. **Test user login**:
   - Navigate to login page
   - Fill in existing user credentials
   - Submit form
   - Verify dashboard loads
   - Verify user menu is visible
3. **Test logout**:
   - Click user menu
   - Click logout option
   - Verify user is logged out
   - Verify redirect to login page

#### E2E-02: Complete Game Flow
**File**: `tests/e2e/game-flow.spec.ts`

**Test Steps**:
1. **Setup**: Login two users in separate browser contexts
2. **Test challenge creation**:
   - User 1 creates challenge with description
   - Verify challenge appears in User 1's challenges
   - Verify challenge appears in User 2's received challenges
3. **Test challenge acceptance**:
   - User 2 accepts challenge
   - Both users pick numbers
   - Verify numbers are recorded
4. **Test challenge resolution**:
   - Verify challenge is resolved
   - Check if numbers match
   - Verify correct result displayed
5. **Test cleanup**:
   - Remove friendship between users
   - Verify clean state

#### E2E-03: Friend Request Flow
**File**: `tests/e2e/friend-request-flow.spec.ts`

**Test Steps**:
1. **Setup**: Login two users
2. **Test send friend request**:
   - User 1 searches for User 2
   - User 1 sends friend request
   - Verify request sent confirmation
3. **Test accept friend request**:
   - User 2 navigates to received requests
   - User 2 accepts request
   - Verify friendship established
4. **Test verify friendship**:
   - Both users check friends list
   - Verify both users appear in each other's friends list

#### E2E-04: Friend ID Workflow
**File**: `tests/e2e/friend-id-workflow.spec.ts`

**Test Steps**:
1. **Test generate friend ID**:
   - User generates friend ID
   - Verify ID is displayed
   - Verify ID format is correct
2. **Test share friend ID**:
   - User copies friend ID
   - Verify ID is copied to clipboard
3. **Test lookup by friend ID**:
   - User searches by friend ID
   - Verify user is found
   - Verify user details displayed

#### E2E-05: Friends Management
**File**: `tests/e2e/friends-flow.spec.ts`

**Test Steps**:
1. **Test add friend**:
   - Search for friend by username/email
   - Send friend request
   - Verify request sent
2. **Test remove friend**:
   - Navigate to friends list
   - Remove existing friend
   - Verify friend removed
3. **Test friends list**:
   - Verify all friends displayed
   - Test friend search
   - Test friend filtering

#### E2E-06: UI Features
**File**: `tests/e2e/ui-features.spec.ts`

**Test Steps**:
1. **Test theme toggle**:
   - Toggle between light and dark themes
   - Verify theme persists on reload
   - Verify all components respect theme
2. **Test language switch**:
   - Switch between English and Hebrew
   - Verify RTL layout for Hebrew
   - Verify all text is translated
3. **Test responsive design**:
   - Test on mobile viewport
   - Test on tablet viewport
   - Test on desktop viewport
   - Verify layout adapts correctly

#### E2E-07: Error Handling
**File**: `tests/e2e/error-handling.spec.ts`

**Test Steps**:
1. **Test network errors**:
   - Simulate network disconnection
   - Verify error messages displayed
   - Test retry functionality
2. **Test validation errors**:
   - Submit invalid forms
   - Verify validation messages
   - Test form reset
3. **Test API errors**:
   - Simulate server errors
   - Verify error handling
   - Test fallback behavior

#### E2E-08: Performance
**File**: `tests/e2e/performance.spec.ts`

**Test Steps**:
1. **Test page load times**:
   - Measure initial page load
   - Measure navigation times
   - Verify performance targets met
2. **Test responsiveness**:
   - Test UI responsiveness
   - Test animation smoothness
   - Test scroll performance
3. **Test memory usage**:
   - Monitor memory usage
   - Test for memory leaks
   - Verify cleanup on navigation

#### E2E-09: Health Check
**File**: `tests/e2e/health-check.spec.ts`

**Test Steps**:
1. **Test API endpoints**:
   - Test all API endpoints respond
   - Verify response times
   - Test error responses
2. **Test database connectivity**:
   - Test Firebase connection
   - Test data read/write
   - Test real-time updates
3. **Test external services**:
   - Test FCM connectivity
   - Test authentication service
   - Test file upload service

## 6 Coverage Targets

- Frontend: 90% line and branch coverage via Vitest
- Backend: 90% via Pytest with `--cov=app`
- Full E2E flow: Minimum 9 high-confidence user paths
- Coverage reports published via Allure in CI/CD pipeline

## 7 Security & Audit Tests

| Tool      | Purpose                      |
| --------- | ---------------------------- |
| Bandit    | Python backend scan          |
| npm audit | Frontend dependency scan     |
| Trivy     | Docker image vulnerabilities |

## 8 Automation & CI/CD

- Tests run on every PR via GitHub Actions
- Allure Reports are published as build artifacts and GitHub Pages
- Pre-commit hooks run unit/lint tests
- Docker containers for consistent test environments

## 9 Test Execution

### 9.1 Running Frontend Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### 9.2 Running Backend Tests
```bash
# Unit tests
cd backend
pytest

# With coverage
pytest --cov=app --cov-report=html

# With Allure
pytest --alluredir=allure-results
```

### 9.3 Running All Tests
```bash
# Frontend + Backend + E2E
make test

# With coverage reports
make test-coverage
```

## 10 Acceptance Criteria

- All tests must pass (unit + E2E)
- ≥90% test coverage
- No high-severity vulnerabilities
- Allure reports generated for each test run
- Tests run in CI/CD pipeline on every commit
- Manual test run log for final milestone

## 11 Test Data Management

### 11.1 Test Users
- **testuser1@example.com** - Primary test user
- **testuser2@example.com** - Secondary test user
- **admin@example.com** - Admin test user

### 11.2 Test Data Cleanup
- Automatic cleanup after each test run
- Database reset between test suites
- Fresh test data for each E2E test

### 11.3 Test Environment Isolation
- Separate Firebase project for testing
- Isolated test database
- Mock external services where appropriate
