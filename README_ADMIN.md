# Admin Panel Documentation

## Overview
The admin panel provides a secure interface for administrators to manage users and recruiters in the application. Administrators can view, and delete user accounts.

## Setup

### 1. Run the Admin Seeder
Before accessing the admin panel, you need to create an admin user. Run the following command from the server directory:

```bash
npm run seed:admin
```

This will create an admin user with the following credentials:
- Email: admin@example.com
- Password: Admin@123

### 2. Accessing the Admin Panel
Once the admin user is created, you can access the admin panel at:

```
http://localhost:5173/admin
```

## Features

### Authentication
- The admin panel uses JWT-based authentication 
- Only users with the 'admin' role can access the admin dashboard
- The session persists across browser refreshes

### User Management
- View all regular users registered in the system
- View all recruiters registered in the system
- Delete user accounts (both regular users and recruiters)
- Cannot delete other admin accounts for security reasons

## API Endpoints

### Admin Authentication
Uses the standard authentication system with role-based access control.

### User Management
- GET `/api/admin/users` - Get all users (excluding admins)
- GET `/api/admin/recruiters` - Get all recruiters
- DELETE `/api/admin/users/:userId` - Delete a specific user

## Security Notes
- All admin routes are protected by middleware that verifies the admin role
- JWT tokens are stored in HTTP-only cookies for security
- Rate limiting is applied to prevent brute force attacks
- Input validation is performed server-side to prevent injection attacks 