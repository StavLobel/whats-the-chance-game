## System Requirements Document (SRD) for "What's the Chance?" Web Application

**Date:** July 17, 2025  
**Version:** 1.0

---

### 1. Introduction

This document details the requirements for developing a web application for the game "What's the Chance?". The application will enable two players to play remotely via an interactive web platform, with full support for the Hebrew language and Hebrew input.

#### 1.1 Document Purpose

The purpose of this document is to provide a comprehensive and unambiguous description of the system's functionality, technical requirements, and constraints. It will serve as a basis for the project's planning and development by the development team, or as input for AI tools like Cursor AI.

#### 1.2 Application Overview

The "What's the Chance?" application is a web-based tool that allows two players to digitally engage in the "What's the Chance?" game. The game involves humorous challenges, the selection of number ranges and secret numbers, and real-time resolution. The system will include user management, a mission board, a notification system, and a mechanism for appealing number ranges.

---

### 2. Functional Requirements

The application will include the following functionality:

#### 2.1 User Management

* **Registration (SR.UM.001):** The system will allow new users to register for the application. The registration process will include a **username (with full Hebrew support)**, password, and other necessary identification details. All data will be stored in Firebase.
* **Login (SR.UM.002):** The system will allow registered users to log in to the application using their username and password.
* **User Profile (SR.UM.003):** The system will store and display a basic profile for each user (e.g., username). All input and display of user data will fully support **Hebrew**.

#### 2.2 Challenge Board

* **Mission Display (SR.CB.001):** The system will display a central "Challenge Board" showing all active and historical missions. Each mission will be presented as a preview with an updated status. The board will support **Hebrew display** and **Right-to-Left (RTL) direction**.
* **Mission Statuses (SR.CB.002):** The system will display the following mission statuses, in **Hebrew**:
    * **"משימה חדשה"** (New Mission): A mission created by Player A, awaiting Player B's response.
    * **"המשימה התקבלה"** (Mission Accepted): Player B has accepted the mission, but final numbers have not yet been defined or chosen.
    * **"הוגדר טווח ביצוע משימה"** (Range Defined): Player B has defined a range and chosen a number, awaiting Player A's response (number selection or appeal).
    * **"טווח המשימה בערעור"** (Mission Range Under Appeal): Player A has appealed the number range, awaiting Player B's response to the appeal.
    * **"המשימה התקבלה (מספרים זהים)"** (Mission Accepted - Numbers Matched): Player A's and Player B's numbers are identical (will be displayed in green).
    * **"המשימה לא התקבלה"** (Mission Not Accepted): Player A's and Player B's numbers are different (will be displayed in red).
    * **"המשימה סורבה"** (Mission Declined): Player B refused to perform the mission.
    * **"המשימה בוטלה"** (Mission Canceled): The mission was generally canceled (e.g., by Player A if a cancel button is added).
    * **"המשימה בוטלה (ריבוי ערעורים)"** (Mission Canceled - Too Many Appeals): The mission was automatically closed due to exceeding the appeal limit.
* **Visual Indication (SR.CB.003):** Missions concluded with matching numbers will be visually marked in **green**. Missions concluded without matching numbers will be visually marked in **red**.

#### 2.3 Mission Creation (Player A)

* **Mission Creation Form (SR.CM.001):** The system will allow Player A to create a new mission using a dedicated form. The form will include a field for the mission description (with full **Hebrew input** support). The form will include a field for tagging (or selecting from a list of registered users) of Player B to challenge them. The mission name and description will support **Hebrew input and display**.

#### 2.4 Player B's Response to Mission

* **Receive Notification (SR.RB.001):** Player B will receive a **real-time notification** when challenged with a new mission by Player A.
* **Response Options (SR.RB.002):** The system will present Player B with an interface allowing them to:
    * **Decline the mission:** In this case, the mission will be closed and updated as **"המשימה סורבה"** (Mission Declined).
    * **Accept the mission:** In this case, Player B will be required to:
        * Define the number range for performing the mission (e.g., 1-10, 1-50).
        * Secretly choose a number within the defined range.
* **Input Support (SR.RB.003):** Input fields for number ranges and number selection will support valid numeric input.

#### 2.5 Player A's Response After Mission Acceptance

* **Receive Notification (SR.RA.001):** Player A will receive a **real-time notification** when Player B responds to the mission. The notification will indicate if the mission was declined (in which case the mission closes).
* **Range Display and Number Selection (SR.RA.002):** If the mission was accepted by Player B, Player A will be able to view the range Player B defined. Player A will be required to secretly choose their own number within that range.
* **Range Appeal Mechanism (SR.RA.003):** Player A will be able to **appeal the range** set by Player B if they believe it is too wide for the mission. An "Appeal" button/option will be displayed to Player A after Player B selects a range. The system will track the number of appeals made for each mission.
    * **Appeal Limit (SR.RA.004):** The system will allow a **maximum of 3 appeals** per mission. After the third appeal by Player A, if Player B does not select a new range or decline the mission, the system will **automatically close the mission** and update its status to **"המשימה בוטלה (ריבוי ערעורים)"** (Mission Canceled - Too Many Appeals). Both players (A and B) will receive a notification about the mission closure due to exceeding the appeal limit.

#### 2.6 Player B's Response to Appeal

* **Receive Appeal Notification (SR.RBA.001):** Player B will receive a **real-time notification** when Player A appeals the number range.
* **Appeal Response Options (SR.RBA.002):** The system will present Player B with an interface allowing them to:
    * **Accept the appeal:** In this case, Player B will be required to define a new, narrower number range (which is expected to be more limited) and choose a new secret number within the updated range.
    * **Decline the mission:** In this case, the mission will be closed and updated as **"המשימה סורבה"** (Mission Declined).

#### 2.7 Mission Completion and Resolution

* **Results Notification (SR.EM.001):** Once both Player A and Player B have selected their secret numbers (after final range definition), both will receive a notification that the mission is complete and results are available.
* **Results Display (SR.EM.002):** The system will reveal the numbers chosen by both players. The system will determine if there is a match or not.
* **Mission Status Update (SR.EM.003):** The mission will be updated according to its final status: **"המשימה התקבלה (מספרים זהים)"** (Mission Accepted - Numbers Matched) or **"המשימה לא התקבלה"** (Mission Not Accepted). The main board will update to display the mission with the appropriate color and status.

#### 2.8 Notification System

* **Real-time Notifications (SR.NT.001):** The system will provide **real-time notifications** for critical events: challenge assignment for a new mission, Player B's response to a mission (acceptance/declination), Player A's appeal of a range, Player B's response to an appeal (acceptance/declination), mission completion (results availability), and mission closure due to excessive appeals. All notifications will be displayed in **Hebrew**.

---

### 3. Non-Functional Requirements

#### 3.1 Performance

* **Response Times (NFR.PER.001):** The application will respond to user actions within 1-2 seconds under reasonable network conditions (excluding operations requiring lengthy processing). Real-time updates (like mission status and notifications) will appear within less than one second.
* **Scalability (NFR.PER.002):** The system will be designed to be scalable to support a future increase in the number of users and missions.

#### 3.2 Security

* **User Authentication (NFR.SEC.001):** All user actions will be authenticated. User passwords will be encrypted.
* **Data Protection (NFR.SEC.002):** Sensitive data (such as secret numbers chosen before revelation) will be secured and accessible only to the relevant users at the appropriate time.
* **Security Testing (NFR.SEC.003):** The backend code will be scanned using **Bandit** to identify common security issues.

#### 3.3 Usability and Design

* **Intuitive User Interface (NFR.US.001):** The interface will be clean, clear, and easy to use for non-technical users.
* **Design (NFR.US.002):** All graphic design (UI/UX) of the application will be developed in **Figma** before code implementation. The design will specifically address **Hebrew typography** and **RTL (Right-to-Left) layout conventions**.
* **Language Support (NFR.US.003):** The entire system will be in **Hebrew**. All input fields (usernames, mission descriptions, etc.) will fully support **Hebrew text input** and **RTL text direction**.

#### 3.4 Reliability

* **Error Handling (NFR.REL.001):** The system will handle errors gracefully and provide clear error messages to users.
* **Data Durability (NFR.REL.002):** The system will be resilient against data loss in case of failures.

#### 3.5 Maintainability and Development

* **Clean Code (NFR.DEV.001):** The code will be modular, well-documented, and easy to maintain.
* **Code Formatting (NFR.DEV.002):** The Python code (backend) will be automatically formatted using **Black** to ensure consistent style.

---

### 4. Technology Stack

The project will be developed using the following technology stack:

* **Application Type:** Web Application
* **Frontend:** **Flutter**
    * Will provide a responsive and cross-platform user interface (Web, Mobile).
    * Includes built-in support for **RTL (Right-to-Left) direction** and full **Hebrew internationalization (i18n)**.
* **Backend:** **FastAPI** (Python 3.7+)
    * A fast and lightweight framework for building APIs.
    * Will support handling text data encoded in **UTF-8 (including Hebrew)**.
* **Database & Real-time Features:** **Firebase**
    * **Firestore:** For structured data storage of users, missions, statuses, etc.
    * **Realtime Database / Cloud Functions:** For managing real-time data synchronization, notifications, and handling critical logic (such as automatic mission closure due to appeals).
* **Version Control & CI/CD:**
    * **GitHub:** For source code hosting, version control, and collaboration.
    * **GitHub Actions:** For Continuous Integration (CI) and Continuous Deployment (CD) pipelines.
        * Automation of testing, building, and deployment.
* **Code Quality (Python):**
    * **Bandit:** A static security analysis tool for Python code.
    * **Black:** An automatic code formatter for Python.
* **Design:** **Figma**
    * The entire design process (Wireframes, Mockups, Prototypes) will be conducted in Figma, with an emphasis on adapting to the **Hebrew language** and **RTL direction**.

---

### 5. Infrastructure and Deployment

* **Hosting:** Private server on **Hostinger**.
    * A Linux-based VPS with specifications suitable for the expected load.
* **Deployment Strategy:**
    * GitHub Actions will build and deploy the FastAPI application (potentially via Docker) and the Flutter web build directly to the Hostinger server.
    * Deployment will be automated following pushes to designated branches in GitHub.

--- 