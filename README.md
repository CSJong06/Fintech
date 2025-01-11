# FinTech App

## Overview
The **FinTech App** is a full-stack financial application built using **Node.js**, **Express**, **MySQL**, and **Sequelize ORM**. It features secure user authentication and allows users to manage financial transactions like deposits and withdrawals.

---

## Table of Contents
- [FinTech App](#fintech-app)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Configuration Setup](#configuration-setup)
    - [**Environment Variables**](#environment-variables)
  - [Authentication Logic](#authentication-logic)
    - [**1. User Model**](#1-user-model)
    - [**2. Routes for Authentication**](#2-routes-for-authentication)
    - [**3. Route Guards**](#3-route-guards)
  - [Database Schema](#database-schema)
  - [Running the Application](#running-the-application)
    - [Prerequisites:](#prerequisites)
    - [Steps:](#steps)
  - [Dependencies](#dependencies)
  - [Future Enhancements](#future-enhancements)

---

## Configuration Setup

The project uses `dotenv` to manage environment variables. Make sure to set up a `.env` file at the root directory with the following configuration:

### **Environment Variables**
```dotenv
DB_HOST=localhost            # MySQL Server Host
DB_PORT=3306                 # MySQL Port
DB_NAME=db                   # Database Name
DB_USER=root                 # MySQL Username
DB_PASSWORD=MySQL_Passwd     # MySQL Password
DB_DIALECT=mysql             # Database Dialect (Sequelize)
PORT=3000                    # Application Port
JWT_SECRET=super_secret      # JWT Secret for Token Generation
JWT_EXPIRES_IN=1h            # JWT Expiry Time
```
> Replace placeholders like `Password$123` and `super_secret` with your own secure values.

---

## Authentication Logic

The authentication system relies on:
1. **Session Management** using `express-session`
2. **Password Hashing** with `bcryptjs`
3. **JWT Support** for future extensions (optional)

### **1. User Model**
Defined in `user.js`:
- **Fields**: `id`, `email`, `username`, `password_hash`, and `balance`
- **Password Hashing**: Passwords are hashed using `bcryptjs` before being stored.

Example Snippet:
```javascript
import bcrypt from 'bcryptjs';

const passwordHash = await bcrypt.hash(password, 10); // Hash password
```

---

### **2. Routes for Authentication**

Routes are defined in `auth.js`:
- **Login** (`/login`): Allows users to authenticate with email and password.
- **Register** (`/register`): Enables new user registration.
- **Logout** (`/logout`): Clears user session.

Example Snippet:
```javascript
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  // Check user credentials and start session
});
```

### **3. Route Guards**
A middleware `requireAuth` ensures that only authenticated users can access secure pages like `/dashboard` and `/transactions`:
```javascript
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};
```
---

## Database Schema

The **User** and **Transaction** models are linked via `foreignKey`:
- **User**: Holds user information like email, password, and balance.
- **Transaction**: Tracks deposits and withdrawals.

Database tables:
```sql
CREATE TABLE user (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  balance DECIMAL(10, 2) DEFAULT 0.00
);

CREATE TABLE transaction (
  id INT PRIMARY KEY AUTO_INCREMENT,
  amount DECIMAL(10, 2) NOT NULL,
  type VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  user_id INT,
  FOREIGN KEY (user_id) REFERENCES user(id)
);
```

---

## Running the Application

### Prerequisites:
- Node.js installed
- MySQL server running

### Steps:
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup `.env` as described.
4. Start the server:
   ```bash
   npm start
   ```
5. Access the app at `http://localhost:3000`.

---

## Dependencies
Key dependencies include:
- **express**: Web framework
- **sequelize**: ORM for MySQL
- **bcryptjs**: Password hashing
- **express-session**: Session management
- **dotenv**: Environment variable management.

Full list of dependencies can be found in the `package.json` file.

---

## Future Enhancements
- Add JWT-based authentication for API security.
- Enable deployment to cloud platforms like Heroku or AWS.
- Enhance UI with more dynamic components.
