# What's the Chance? Web Application

A two-player web application for the game "What's the Chance?" supporting full Hebrew language and RTL layout.

## Purpose
This app allows two players to play humorous challenge-based missions, with real-time status, appeals, and notifications. All user-facing text and UI are in Hebrew, and the system is designed for RTL from the ground up.

## Tech Stack
- **Frontend:** Flutter (Web, RTL, Hebrew i18n)
- **Backend:** FastAPI (Python 3.7+)
- **Database & Real-time:** Firebase (Firestore, Realtime Database, Cloud Functions)
- **CI/CD:** GitHub Actions
- **Hosting:** Hostinger (Linux VPS)

## Key Features
- User management and profiles
- Challenge board with mission statuses
- Real-time notifications and updates
- Appeal mechanism (max 3 per mission)
- Secure handling of secret numbers
- Strict RTL and Hebrew-first design

## Project Structure
- `.cursor/rules/` — Project rules for Cursor AI
- `SRD.md` — System Requirements Document
- `TASKS.md` — Project task breakdown

---

For more details, see `SRD.md` and the rules in `.cursor/rules/`. 