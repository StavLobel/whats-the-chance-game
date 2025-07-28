# What's the Chance? - Backend API

A FastAPI-based backend service for the "What's the Chance?" social game, providing RESTful APIs for challenge management, user authentication, and real-time notifications.

## 🏗️ Architecture

The backend follows a clean, modular architecture with the following components:

### Core Structure
```
backend/
├── app/
│   ├── core/           # Configuration and core utilities
│   │   ├── config.py   # Environment-based settings
│   │   └── auth.py     # Authentication middleware
│   ├── models/         # Database models (Firestore)
│   ├── routers/        # API route handlers
│   │   ├── challenges.py
│   │   └── notifications.py
│   ├── schemas/        # Pydantic data models
│   │   ├── challenge.py
│   │   ├── user.py
│   │   └── notification.py
│   └── services/       # Business logic services
│       └── firebase_service.py
├── tests/              # Test suites
├── main.py            # FastAPI application entrypoint
├── requirements.txt   # Python dependencies
└── env.example        # Environment variables template
```

### Key Features

- **🔐 Firebase Authentication**: Secure user authentication with Firebase Admin SDK
- **🗄️ Firestore Database**: NoSQL database for game data and user management
- **📱 Push Notifications**: Firebase Cloud Messaging for real-time notifications
- **🛡️ Security**: JWT tokens, CORS protection, and input validation
- **📊 Real-time Updates**: WebSocket support for live game updates
- **🧪 Comprehensive Testing**: Unit, integration, and E2E tests
- **📈 Monitoring**: Structured logging and error tracking

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Firebase project with Firestore enabled
- Firebase service account credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd whats-the-chance-game/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your Firebase credentials
   ```

5. **Run the development server**
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:8000`

## ⚙️ Configuration

### Environment Variables

Copy `env.example` to `.env` and configure the following variables:

#### Required Variables
- `SECRET_KEY`: Secret key for JWT token signing
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_PRIVATE_KEY`: Firebase service account private key
- `FIREBASE_CLIENT_EMAIL`: Firebase service account email

#### Optional Variables
- `DEBUG`: Enable debug mode (default: false)
- `PORT`: Server port (default: 8000)
- `ALLOWED_ORIGINS`: CORS allowed origins (comma-separated)
- `REDIS_URL`: Redis connection URL for caching

### Firebase Setup

1. **Create a Firebase project** at [Firebase Console](https://console.firebase.google.com/)

2. **Enable Firestore Database**
   - Go to Firestore Database in Firebase Console
   - Create database in production mode
   - Choose a location

3. **Generate service account key**
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Extract the credentials to your `.env` file

4. **Enable Authentication**
   - Go to Authentication in Firebase Console
   - Enable Email/Password authentication
   - Configure sign-in methods as needed

## 📚 API Documentation

### Interactive Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:8000/api/docs`
- **ReDoc**: `http://localhost:8000/api/redoc`

### Core Endpoints

#### Challenges API (`/api/challenges`)
- `POST /` - Create a new challenge
- `GET /{challenge_id}` - Get challenge details
- `POST /{challenge_id}/respond` - Respond to a challenge
- `POST /resolve` - Resolve challenge with numbers
- `GET /user/{user_id}` - Get user's challenges
- `GET /stats/{user_id}` - Get challenge statistics

#### Notifications API (`/api/notifications`)
- `POST /send` - Send push notification
- `POST /send/batch` - Send batch notifications
- `POST /send/topic` - Send topic notification
- `POST /tokens` - Register FCM token
- `DELETE /tokens/{token}` - Unregister FCM token
- `POST /topics/{topic}/subscribe` - Subscribe to topic
- `POST /topics/{topic}/unsubscribe` - Unsubscribe from topic
- `GET /history/{user_id}` - Get notification history
- `GET /stats/{user_id}` - Get notification statistics

### Authentication

All protected endpoints require a valid Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/unit/test_firebase_service.py

# Run with verbose output
pytest -v
```

### Test Structure

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows with Playwright

### Test Coverage

The project aims for 90%+ test coverage across all modules.

## 🐳 Docker Deployment

### Build Image

```bash
docker build -t whats-the-chance-backend .
```

### Run Container

```bash
docker run -p 8000:8000 --env-file .env whats-the-chance-backend
```

### Docker Compose

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
      - FIREBASE_PRIVATE_KEY=${FIREBASE_PRIVATE_KEY}
      - FIREBASE_CLIENT_EMAIL=${FIREBASE_CLIENT_EMAIL}
    depends_on:
      - redis
  
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

## 🔧 Development

### Code Quality

The project uses several tools to maintain code quality:

- **Black**: Code formatting
- **isort**: Import sorting
- **Flake8**: Linting
- **MyPy**: Type checking
- **Pre-commit**: Git hooks

### Pre-commit Setup

```bash
# Install pre-commit hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

### Adding New Features

1. **Create schemas** in `app/schemas/`
2. **Add business logic** in `app/services/`
3. **Create API routes** in `app/routers/`
4. **Write tests** in `tests/`
5. **Update documentation**

## 📊 Monitoring & Logging

### Structured Logging

The application uses structured logging with `structlog`:

```python
import logging
logger = logging.getLogger(__name__)
logger.info("User action", user_id=user_id, action="challenge_created")
```

### Error Tracking

Sentry integration for error monitoring in production:

```python
import sentry_sdk
sentry_sdk.init(dsn="your-sentry-dsn")
```

## 🔒 Security

### Authentication Flow

1. Client obtains Firebase ID token from Firebase Auth
2. Token is sent with API requests in Authorization header
3. Backend verifies token with Firebase Admin SDK
4. User information is extracted and used for authorization

### Data Validation

- All input data is validated using Pydantic schemas
- SQL injection protection through Firestore
- XSS protection through input sanitization
- CORS protection for cross-origin requests

## 🚀 Production Deployment

### Environment Setup

1. Set `DEBUG=false` in production
2. Use strong `SECRET_KEY`
3. Configure production Firebase project
4. Set up Redis for caching
5. Configure monitoring and logging

### Performance Optimization

- Enable Redis caching for frequently accessed data
- Use Firebase Firestore indexes for complex queries
- Implement connection pooling for database connections
- Monitor API response times and optimize slow endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the API documentation at `/api/docs`
- Review the test files for usage examples 