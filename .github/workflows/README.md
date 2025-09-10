# 🧪 GitHub Actions Test Workflows

This directory contains comprehensive GitHub Actions workflows for the "What's the Chance?" game, implementing all test suites defined in the **Software Test Plan (STP.md)**.

## 📁 Workflow Files

### Individual Test Suite Workflows (Manual Trigger)

| Workflow | File | Description | Test Cases |
|----------|------|-------------|------------|
| 🧪 **Frontend Unit Tests** | `frontend-unit-tests.yml` | React/TypeScript unit tests | F-01 to F-07 (7 parallel jobs) |
| 🔧 **Backend Unit Tests** | `backend-unit-tests.yml` | FastAPI/Python unit tests | B-01 to B-05 (5 parallel jobs) |
| 🔗 **Integration Tests** | `integration-tests.yml` | Frontend ↔ Backend integration | I-01 to I-04 (4 parallel jobs) |
| 🎭 **E2E Tests** | `e2e-tests.yml` | Full user journey testing | E2E-01 to E2E-09 (Multi-browser) |
| 🔒 **Security & Audit** | `security-audit-tests.yml` | Security scans and audits | 4 security scan types |

### Main Orchestrator Workflow

| Workflow | File | Description |
|----------|------|-------------|
| 🧪 **Main Testing Workflow** | `main-testing-workflow.yml` | Runs all test suites with configuration options |

## 🚀 How to Run Workflows

### Option 1: Run All Tests
1. Go to **Actions** tab in GitHub
2. Select **"🧪 Main Testing Workflow"**
3. Click **"Run workflow"**
4. Choose configuration:
   - **Test Suites**: `all` (default)
   - **Browser**: `chromium` (default)
   - **Parallel Execution**: `true` (default)

### Option 2: Run Specific Test Suite
1. Go to **Actions** tab in GitHub
2. Select the specific workflow (e.g., "🧪 Frontend Unit Tests")
3. Click **"Run workflow"**
4. Choose test suite options if available

### Option 3: Run with Custom Configuration
1. Select **"🧪 Main Testing Workflow"**
2. Click **"Run workflow"**
3. Configure options:
   - **Test Suites**: 
     - `all` - Run all test suites
     - `unit-tests-only` - Frontend + Backend unit tests
     - `integration-tests-only` - Integration tests only
     - `e2e-tests-only` - End-to-end tests only
     - `security-tests-only` - Security scans only
     - `frontend-backend-only` - Unit + Integration tests
     - `quick-tests` - Fast unit tests only
   - **Browser**: `chromium`, `firefox`, `webkit`, or `all`
   - **Parallel Execution**: `true` or `false`

## 📊 Test Suite Details

### 🧪 Frontend Unit Tests
- **F-01**: Friend ID API Service Tests
- **F-02**: Friend ID Integration Tests
- **F-03**: React Hooks Tests (useFriendId, useUserDisplay)
- **F-04**: Game Service Tests
- **F-05**: Game Utils Tests
- **F-06**: Realtime Connection Tests
- **F-07**: User Lookup Service Tests

### 🔧 Backend Unit Tests
- **B-01**: User Model Tests
- **B-02**: Challenge Validation Tests
- **B-03**: Friend ID API Tests
- **B-04**: Firebase Service Tests
- **B-05**: Game Stats Tests

### 🔗 Integration Tests
- **I-01**: Friend ID Workflow Integration
- **I-02**: Game Service Integration
- **I-03**: API Integration Tests (parallel matrix)
- **I-04**: Real-time Features Integration

### 🎭 E2E Tests
- **E2E-01**: Authentication Flow
- **E2E-02**: Complete Game Flow
- **E2E-03**: Friend Request Flow
- **E2E-04**: Friend ID Workflow
- **E2E-05**: Friends Management
- **E2E-06**: UI Features (Theme, Language, Responsive)
- **E2E-07**: Error Handling
- **E2E-08**: Performance Testing
- **E2E-09**: Health Check

### 🔒 Security & Audit Tests
- **Frontend Security**: npm audit, ESLint security rules, secrets check
- **Backend Security**: Bandit, Safety, secrets check
- **Docker Security**: Trivy vulnerability scanning
- **Dependency Security**: Outdated package detection

## 🎯 Features

### Parallel Execution
- ✅ **Test cases run in parallel** for maximum speed
- ✅ **Matrix strategies** for multi-browser and multi-API testing
- ✅ **Test suites run simultaneously** when using main workflow

### Advanced Reporting
- 📊 **Coverage Reports**: HTML, JSON, and text formats
- 📋 **Test Reports**: Allure reports for backend, HTML reports for E2E
- 🎭 **Playwright Reports**: Interactive E2E test results
- 🔒 **Security Reports**: Detailed vulnerability assessments

### Configuration Options
- 🎛️ **Selective Test Execution**: Choose which test suites to run
- 🌐 **Multi-Browser Support**: Chromium, Firefox, WebKit
- ⚡ **Performance Optimization**: Parallel vs sequential execution
- 📈 **Coverage Analysis**: Automatic coverage collection

## 📈 Coverage Targets

- **Frontend**: 90% line and branch coverage via Vitest
- **Backend**: 90% coverage via Pytest with `--cov=app`
- **Integration**: Full API endpoint coverage
- **E2E**: Complete user journey coverage

## 🛠️ Technology Stack

- **GitHub Actions**: Workflow orchestration
- **Node.js 18**: Frontend testing environment
- **Python 3.11**: Backend testing environment
- **Vitest**: Frontend unit testing with React Testing Library
- **Pytest**: Backend unit testing with Allure reports
- **Playwright**: Multi-browser E2E testing
- **Security Tools**: Bandit, Safety, Trivy, ESLint
- **Coverage Tools**: Built-in coverage reporting

## 📋 Artifacts

Each workflow generates artifacts that are retained for 30-90 days:

- **Coverage Reports**: HTML and JSON coverage data
- **Test Results**: Detailed test execution results
- **Allure Reports**: Interactive test reports for backend
- **Playwright Reports**: Interactive E2E test results
- **Security Reports**: Vulnerability scan results
- **Logs**: Detailed execution logs for debugging

## 🔧 Troubleshooting

### Common Issues

1. **Workflow fails to start**
   - Check if all required secrets are configured
   - Verify Firebase project configuration

2. **Tests fail due to environment**
   - Ensure test data is properly set up
   - Check if services are running correctly

3. **Coverage below target**
   - Review uncovered code sections
   - Add missing test cases

4. **Security scans report issues**
   - Review security scan results
   - Update dependencies if needed
   - Fix identified vulnerabilities

### Getting Help

- Review workflow logs in the GitHub Actions tab
- Check test artifacts for detailed reports
- Refer to the Software Test Plan (STP.md) for test specifications
- Review individual test files for specific test implementations

## 📚 Related Documentation

- **Software Test Plan**: `documentation/STP.md`
- **GitHub Issue #22**: Advanced CI/CD Pipeline enhancement
- **Project Documentation**: `documentation/` directory
- **Test Files**: `tests/`, `backend/tests/`, `src/test/` directories

---

**Note**: All workflows are configured for **manual trigger only** (`workflow_dispatch`). No automatic triggers are set up to maintain control over test execution.
