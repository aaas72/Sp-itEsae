# 🏠 SplitEase — Expense Sharing Mobile Application

SplitEase is a modern, premium, and feature-rich cross-platform mobile application designed for roommates, friends, and teams to easily manage shared expenses, track balances, settle debts, and view detailed financial analytics.

This repository contains both the **Mobile App (Frontend)** and the **API Server (Backend)**.

---

## 🚀 Key Features

*   **Secure Authentication:** JWT-based user register/login with secure local storage (Expo SecureStore) and auto-refresh token handling.
*   **Group Management:** Create and edit groups (e.g., Household, Food, Trips), manage group members and roles (Admin/Member), and invite users via email.
*   **Expense Splitting:** Create transactions/expenses with custom amounts and descriptions. Expenses are automatically split equally among chosen group members.
*   **Debt Tracking & Settle:**
    *   Net balance calculations between group members.
    *   Filterable debt list (Active vs. Settled).
    *   Single debt settlement or bulk "Settle All" to resolve all balances between two members at once.
*   **Financial Analytics:** View total group spending, monthly expenditure trends, and individual spending patterns.
*   **Activity Logging:** A detailed audit trail of all operations (e.g., adding expenses, joining groups, settling debts) for absolute transparency.

---

## 🛠️ Technology Stack

### Mobile App (Frontend)
*   **Framework:** React Native & [Expo (SDK 54)](https://expo.dev)
*   **Navigation:** Expo Router, React Navigation (Drawer & Stack)
*   **Data Fetching:** TanStack React Query (v5)
*   **API Client:** Axios (with request/response interceptors for JWT token rotation)

### API Server (Backend)
*   **Runtime:** Node.js (Express)
*   **Database:** MongoDB Atlas (Mongoose ODM)
*   **Security:** Helmet, CORS, Rate Limiting, BcryptJS password hashing
*   **Logging:** Morgan, Custom Colored Console Logging

---

## 📁 Repository Structure

```text
SplitEsaeNew/
├── SplitEsae/             # Expo React Native App (Frontend)
│   ├── app/               # App routing entry point
│   ├── screens/           # Core screens (Login, Main, GroupDetail, etc.)
│   ├── components/        # Reusable UI components
│   ├── contexts/          # Auth and Theme state providers
│   ├── hooks/             # Custom React Hooks (React Query bindings)
│   └── utils/             # API helpers and local storage wrappers
│
├── server/                # Node.js Express Server (Backend)
│   ├── config/            # Database and .env configuration
│   ├── models/            # Mongoose Schemas (User, Group, Debt, Activity, Transaction)
│   ├── controllers/       # Route request handlers
│   ├── middleware/        # Authentication, Error, and Request Validator middlewares
│   ├── routes/            # Express API endpoints
│   └── validation/        # Request body validator schemas (Joi / Express Validator)
│
├── simulate-all.js        # Full system database seeder and simulator script
└── README.md              # Project documentation
```

---

## ⚙️ Setup and Installation

### Prerequisites
*   [Node.js](https://nodejs.org) (v16+ recommended)
*   [MongoDB](https://www.mongodb.com) (Atlas cloud cluster or local MongoDB instance)
*   [Expo Go app](https://expo.dev/client) on your iOS/Android device, or an Emulator/Simulator.

---

### 1. Backend Server Setup

1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure your environment variables. Open `server/config/.env` and update the values:
    *   `PORT`: `5001` (or your preferred port)
    *   `MONGO_URI`: Your MongoDB connection string
    *   `JWT_SECRET` & `REFRESH_TOKEN_SECRET`: Random hash strings for encryption.
4.  Start the development server (runs with nodemon):
    ```bash
    npm run dev
    ```

---

### 2. Mobile App Setup

1.  Navigate to the app directory:
    ```bash
    cd SplitEsae
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure API Endpoint:
    Open `SplitEsae/utils/api.js` and verify the `getApiBaseUrl` helper targets the correct port and host IP.
    *   For Android Emulators: `http://10.0.2.2:5001/api`
    *   For iOS Simulators: `http://localhost:5001/api`
    *   For physical devices: Use your local PC network IP (e.g., `http://192.168.1.X:5001/api`)
4.  Start the Expo development server:
    ```bash
    npm run start
    ```
5.  Scan the Metro QR code on your mobile device via **Expo Go** or run inside an emulator using the CLI menu.

---

## 🧪 Simulation & Testing

To test the entire API lifecycle with real-world scenarios, a comprehensive simulation script is included. It simulates 5 roommate students sharing expenses across 4 groups.

To run the simulation:
1.  Ensure the backend server configuration `server/config/.env` has a valid database connection.
2.  Run the seeder command from the root directory:
    ```bash
    node simulate-all.js
    ```
This will wipe the temporary databases, register/login users, create groups, send and accept invitations, split bills (rent, internet, dinners), calculate balances, and settle debts automatically, printing step-by-step colored logs.
