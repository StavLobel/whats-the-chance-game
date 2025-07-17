# 🎲 What's the Chance? Web Application

[![CI/CD](https://github.com/<your-username>/<your-repo>/actions/workflows/main.yml/badge.svg)](https://github.com/<your-username>/<your-repo>/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Made with Flutter](https://img.shields.io/badge/Flutter-%2302569B.svg?logo=flutter&logoColor=white)](https://flutter.dev/)
[![Made with FastAPI](https://img.shields.io/badge/FastAPI-005571?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=white)](https://firebase.google.com/)

---

## 🎯 Purpose

A two-player web application for the game "What's the Chance?" supporting full 🇮🇱 Hebrew language and 🏳️‍🌈 RTL layout.

This app allows two players to play humorous challenge-based missions, with real-time status, appeals, and notifications. All user-facing text and UI are in Hebrew, and the system is designed for RTL from the ground up.

---

## 🛠️ Tech Stack

- **Frontend:** 🦋 Flutter (Web, RTL, Hebrew i18n)
- **Backend:** ⚡ FastAPI (Python 3.7+)
- **Database & Real-time:** 🔥 Firebase (Firestore, Realtime Database, Cloud Functions)
- **CI/CD:** 🤖 GitHub Actions
- **Hosting:** 🌐 Hostinger (Linux VPS)

---

## 🔑 Authentication

- **User Registration:**
  - `POST /users/register` — Register a new user (username, password)
- **User Login:**
  - `POST /users/login` — Login with username and password (returns user info)

> **Note:** The backend enables CORS for local development so the Flutter web app can communicate with it.

---

## 🚀 Running the Backend

### Locally

1. Install dependencies:
   ```sh
   cd backend
   pip install -r requirements.txt
   ```
2. Run the server:
   ```sh
   uvicorn backend.main:app --reload
   ```

### With Docker

1. Build the image:
   ```sh
   docker build -t whats-the-chance-backend -f backend/Dockerfile .
   ```
2. Run the container:
   ```sh
   docker run -p 8000:8000 whats-the-chance-backend
   ```

The API will be available at [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🚀 Running the Frontend

1. Install dependencies:
   ```sh
   cd frontend
   flutter pub get
   ```
2. Run the app in Chrome:
   ```sh
   flutter run -d chrome
   ```

- The login page is RTL, fully in Hebrew, and connects to the backend for authentication.
- Make sure the backend is running on port 8000.

---

## 🐳 Docker & Database Persistence

- By default, the backend uses a local SQLite database inside the container. **Data will be lost when the container is removed.**
- For persistent data, mount a volume:
  ```sh
  docker run -p 8000:8000 -v $(pwd)/backend/test.db:/app/backend/test.db whats-the-chance-backend
  ```

---

## ✨ Key Features

- 👤 User management and profiles
- 🗂️ Challenge board with mission statuses
- 🔔 Real-time notifications and updates
- 🛡️ Appeal mechanism (max 3 per mission)
- 🔒 Secure handling of secret numbers
- 🇮🇱 Strict RTL and Hebrew-first design

---

## 📁 Project Structure

- `.cursor/rules/` — Project rules for Cursor AI
- `SRD.md` — System Requirements Document
- `TASKS.md` — Project task breakdown

---

## 📚 More Info

For more details, see [`SRD.md`](SRD.md) and the rules in [`.cursor/rules/`](.cursor/rules/).

---

> Built with ❤️ for Hebrew speakers and RTL-first UX! 

---

## © Copyright

Copyright (c) Stav Lobel
stavlobel@gmail.com
All rights reserved.

This project and its source code are the intellectual property of Stav Lobel. Unauthorized copying, distribution, or use is prohibited without explicit permission. 