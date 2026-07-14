# LeadFlow CRM

LeadFlow CRM is a web-based Customer Relationship Management system for managing leads, users, roles, lead activities, email campaigns, email templates, and email history.

---

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS

### Backend
- Node.js
- Express.js
- Prisma ORM
- JWT Authentication

### Database
- MySQL
- XAMPP MySQL for local development
- Prisma migrations for creating/updating database tables
- phpMyAdmin for viewing and checking local database tables

### Version Control
- Git
- GitHub

---

## Required Software

Before running the project, install the following:

- Node.js
- Git
- XAMPP
- VS Code or any code editor

---

## Local Services Used

- XAMPP MySQL is used as the local database server.
- Prisma is used to create and update database tables through migrations.
- `seed.js` is used to insert starter data such as roles, admin user, lead statuses, and lead sources.
- phpMyAdmin can be used to view and verify the local database tables.
- Backend runs on Node.js and Express.
- Frontend runs on Vite.
- No cron job is currently required.
- No PM2 is currently used for local development.
- SMTP/email provider is still pending final decision.

---

## Project Folder Structure

```text
leadflow/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   │   └── 20260624030701_init_leadflow_schema/
│   │   │       └── migration.sql
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── index.js
│   ├── .env
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

---

## Database Setup Information

The local database is handled through **Prisma migrations**, not through a manually imported SQL dump.

Prisma files are located here:

```text
backend/prisma/schema.prisma
backend/prisma/seed.js
backend/prisma/migrations/
```

The migration file is located here:

```text
backend/prisma/migrations/20260624030701_init_leadflow_schema/migration.sql
```

The local MySQL database name is:

```text
leadflow_crm
```

---

## How to Run the Project Locally

### 1. Clone the Repository

```bash
git clone https://github.com/cubetech-devs/crm.git
cd crm
```

---

### 2. Start XAMPP

Open **XAMPP Control Panel** and start:

```text
Apache
MySQL
```

Apache is used to access phpMyAdmin.  
MySQL is used as the local database server.

Open phpMyAdmin in the browser:

```text
http://localhost/phpmyadmin
```

---

### 3. Create the Local Database

In phpMyAdmin:

1. Click **New**
2. Create a database named:

```text
leadflow_crm
```

Do not import an SQL dump.  
The tables will be created using Prisma migrations.

---

## Backend Setup

Open a terminal:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
DATABASE_URL="mysql://root:@localhost:3306/leadflow_crm"
JWT_SECRET="temporary_signing_secret_for_jwt_leadflow"
```

Important:

```text
Do not upload the real .env file to GitHub.
Do not include real passwords or SMTP credentials in GitHub.
```

Generate Prisma Client:

```bash
npx prisma generate
```

Run Prisma migration to create/update the local database tables:

```bash
npx prisma migrate dev
```

Seed the database with starter data:

```bash
npx prisma db seed
```

Start the backend server:

```bash
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

---

## Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

Open the system in the browser:

```text
http://localhost:5173
```

---

## Login Account

Use the seeded/admin account from the database.

Example:

```text
Email: emilio@cubetech.com
Password: admin123
```

If the login account does not work, run the seed command again:

```bash
cd backend
npx prisma db seed
```

You can also check the `users` table in phpMyAdmin:

```text
http://localhost/phpmyadmin
```

---

## Main Features

- JWT login authentication
- Dashboard
- Lead management
- Add lead
- Edit lead
- Lead details
- Notes and activity timeline
- CSV/Excel lead import
- Duplicate checking
- Email Campaigns UI
- Email Templates UI
- Email History UI
- Users & Roles
- Admin and Staff role access
- Settings page

---

## Admin and Staff Access

### Admin

Admin can access and manage:

```text
Dashboard
Leads
Import Leads
Email Campaigns
Email Templates
Email History
Users & Roles
Settings
```

### Staff

Staff access is limited based on role permissions. Staff should only access assigned work such as:

```text
Assigned leads
Own lead activities
Own email records
Allowed email modules
Personal profile/settings
```

---

## Environment Variables

Backend `.env` example:

```env
PORT=5000
DATABASE_URL="mysql://root:@localhost:3306/leadflow_crm"
JWT_SECRET="temporary_signing_secret_for_jwt_leadflow"
```

Future SMTP setup example:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_google_app_password"
SMTP_FROM_NAME="LeadFlow CRM"
```

SMTP is currently pending final decision.

---

## Common Commands

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Prisma

```bash
cd backend
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

---

## Production Notes

For production deployment:

- Use a hosted MySQL database instead of local XAMPP.
- Set real environment variables on the server.
- Run Prisma migrations on the production database.
- Build the frontend before deployment.
- Deploy the backend on a Node.js hosting/server.
- PM2 can be added later if the backend needs to run continuously.
- SMTP/email provider should be configured after final decision.

Build frontend:

```bash
cd frontend
npm run build
```

---

## External Services

Currently required:

```text
XAMPP MySQL
Prisma ORM
Node.js
Vite development server
```

Optional for local checking:

```text
phpMyAdmin
```

Not currently used:

```text
Cron job
PM2
SMTP provider
Cloud storage
Payment gateway
```

---

## Notes for Deployment

XAMPP is only used for local development.  
For production, use a proper hosted MySQL database and server environment.

Before deployment, make sure:

```text
1. Backend .env is configured.
2. Database connection is working.
3. Prisma migrations are applied.
4. Prisma Client is generated.
5. Seed data is inserted if needed.
6. Frontend API URLs point to the deployed backend.
7. SMTP provider is finalized if email sending is required.
```