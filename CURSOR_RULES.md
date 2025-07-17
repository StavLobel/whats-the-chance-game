# Rules and Guidelines for Cursor AI: "What's the Chance?" Web Application Development

These rules are critical for ensuring the successful development of the "What's the Chance?" web application. Adhere to them strictly.

---

## 1. Core Principles - Hebrew & RTL First
* **Absolute Priority:** All UI elements, text, labels, inputs, outputs, and layout decisions **must be designed and implemented for Hebrew language and Right-to-Left (RTL) direction.** This includes string literals, dynamic content, and component rendering.
* **Localization (i18n):** Implement proper internationalization (i18n) for Hebrew within Flutter.
* **Visual Direction:** Ensure all visual elements (e.g., icons preceding text, progression arrows, form field flow) respect RTL conventions.

## 2. Technology Stack Adherence
* **Frontend:** Develop exclusively using **Flutter** for web deployment.
* **Backend:** Develop exclusively using **FastAPI** (Python 3.7+).
* **Database & Real-time:** Utilize **Firebase** (Firestore for data, Realtime Database/Cloud Functions for real-time updates and critical logic).
* **Version Control:** All code must be managed within **GitHub**.
* **CI/CD:** Implement **GitHub Actions** for automated build, test, and deployment processes.
* **Deployment Target:** Prepare deployment scripts/configurations specifically for a private server on **Hostinger**.

## 3. Code Quality & Security
* **Python Formatting:** Apply **Black** for all Python code formatting in the FastAPI backend. Ensure consistent and clean code.
* **Security Analysis (Python):** Integrate and consider outputs from **Bandit** for static security analysis on the FastAPI backend. Prioritize secure coding practices.
* **Clean Code:** Write modular, well-documented, and maintainable code across both frontend and backend.
* **Error Handling:** Implement robust error handling mechanisms in both frontend and backend, providing clear error messages to the user where appropriate.

## 4. Performance & Scalability
* **Response Times:** Aim for fast response times (<2s for interactions, <1s for real-time updates). Optimize queries and backend logic.
* **Scalable Design:** Ensure the architectural design supports future scaling of users and missions without significant rework.

## 5. Design & Usability
* **Figma Reference:** The UI/UX design from Figma (to be provided/generated separately) must be strictly followed. **Pay meticulous attention to the Hebrew typography and RTL layout established in the Figma designs.**
* **Intuitive Interface:** Create a user-friendly and intuitive interface that simplifies complex game mechanics.

## 6. Functional Logic Specifics
* **Appeal Limit:** Strictly enforce the **maximum of 3 appeals per mission**. Automate mission closure and notification when this limit is reached, setting the status to **"המשימה בוטלה (ריבוי ערעורים)"**.
* **Real-time Notifications:** Ensure all specified critical game events trigger **real-time notifications** to relevant players, in **Hebrew**.
* **Dynamic Statuses:** Accurately update and display all mission statuses in **Hebrew** as defined in the SRD (e.g., "משימה חדשה", "המשימה התקבלה").
* **Visual Status Cues:** Implement **green highlighting** for "המשימה התקבלה (מספרים זהים)" and **red highlighting** for "המשימה לא התקבלה" on the Challenge Board.

## 7. Data Handling
* **Hebrew Data:** Ensure all database interactions (reading, writing) correctly handle and store **UTF-8 encoded Hebrew text** for usernames, mission descriptions, etc.
* **Secret Numbers:** Implement secure handling and revelation of secret numbers at the appropriate stage of the game.

---

**Always default to strict adherence to these rules unless explicitly overridden by a new, specific instruction.** 