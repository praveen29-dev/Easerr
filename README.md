# Easerr Job Portal

A job portal application with authentication, job posting, and application management.

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Firebase account (for storage)

### Server Setup
1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   MONGO_URI=mongodb://localhost:27017/easerr
   JWT_SECRET=your_secure_jwt_secret_key
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   FIREBASE_APP_ID=your_firebase_app_id
   ```

4. Start the server:
   ```
   npm run server
   ```

### Client Setup
1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the client directory with:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Features
- User authentication (Login/Register)
- Role-based access (Job Seeker/Recruiter)
- File uploads (Profile Image, Resume)
- JWT-based authentication
- Secure password handling
- Job posting and application
- Profile management

## Authentication Flow
- Registration with email, password, and optional profile image/resume
- Login with email and password
- JWT tokens for session management
- Protected routes for authenticated users
- Role-based access control

## Tech Stack
- **Frontend**: React, React Router, TanStack Query, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **File Storage**: Firebase Storage
- **Authentication**: JWT-based custom auth