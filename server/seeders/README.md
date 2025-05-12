# Database Seeders

This directory contains seeder scripts for populating the database with initial data.

## Available Seeders

### Admin User Seeder

Creates an administrator account with the following credentials:
- Email: admin@example.com
- Password: Admin@123
- Role: admin

#### Usage

Run the following command from the server directory:

```bash
npm run seed:admin
```

or directly:

```bash
node seeders/adminSeeder.js
```

## Creating New Seeders

To create a new seeder:
1. Create a new file in this directory with a descriptive name (e.g., `categorySeeder.js`)
2. Follow the pattern in existing seeders
3. Add a script to package.json for easy running 