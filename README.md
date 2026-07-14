LeadFlow CRM
LeadFlow CRM is a web-based Customer Relationship Management system for managing leads, users, roles, lead activities, email campaigns, email templates, and email history.

Tech Stack
Frontend
React.js
Vite
Tailwind CSS
Backend
Node.js
Express.js
Prisma ORM
JWT Authentication
Database
MySQL
XAMPP for local MySQL server
phpMyAdmin for database import and management
Version Control
Git
GitHub
Required Software
Before running the project, install the following:

Node.js
Git
XAMPP
VS Code or any code editor
Local Services Used
XAMPP MySQL is used as the local database server.
phpMyAdmin is used to import the database file.
Backend runs on Node.js and Express.
Frontend runs on Vite.
No cron job is currently required.
No PM2 is currently used for local development.
SMTP/email provider is still pending final decision.
Project Folder Structure
leadflow/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
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
├── leadflow_crm.sql
└── README.md
How to Run the Project Locally
1. Clone the Repository
git clone https://github.com/cubetech-devs/crm.git
cd crm
If using the personal repository:

git clone https://github.com/Emils18/leadflow.git
cd leadflow
2. Start XAMPP
Open XAMPP Control Panel and start:

Apache
MySQL
Apache is needed to access phpMyAdmin. MySQL is needed for the database server.

Open phpMyAdmin in the browser:

http://localhost/phpmyadmin
3. Create and Import Database
In phpMyAdmin:

Click New
Create database name:
leadflow_crm
Click the newly created database.
Go to Import
Choose the file:
leadflow_crm.sql
Click Import
After importing, the database should contain tables such as:

users
roles
leads
lead_statuses
lead_sources
lead_activities
lead_notes
email_campaigns
email_templates
email_logs
campaign_recipients
smtp_settings
4. Setup Backend
Open terminal:

cd backend
npm install
Create a .env file inside the backend folder:

PORT=5000
DATABASE_URL="mysql://root:@localhost:3306/leadflow_crm"
JWT_SECRET="temporary_signing_secret_for_jwt_leadflow"
Important:

Do not upload the real .env file to GitHub.
Do not include real passwords or SMTP credentials in GitHub.
Generate Prisma Client:

npx prisma generate
If database was not imported and you want to use migrations instead:

npx prisma migrate dev
npx prisma db seed
Start the backend server:

npm run dev
Backend URL:

http://localhost:5000
5. Setup Frontend
Open another terminal:

cd frontend
npm install
npm run dev
Frontend URL:

http://localhost:5173
Open the system in the browser:

http://localhost:5173
Login Account
Use the seeded/admin account from the database.

Example:

Email: emilio@cubetech.com
Password: admin123
If the login account does not work, check the users table in phpMyAdmin or run the seed command again:

cd backend
npx prisma db seed
Main Features
JWT login authentication
Dashboard
Lead management
Add lead
Edit lead
Lead details
Notes and activity timeline
CSV/Excel lead import
Duplicate checking
Email Campaigns UI
Email Templates UI
Email History UI
Users & Roles
Admin and Staff role access
Settings page
Admin and Staff Access
Admin
Admin can access and manage:

Dashboard
Leads
Import Leads
Email Campaigns
Email Templates
Email History
Users & Roles
Settings
Staff
Staff access is limited based on role permissions. Staff should only access assigned work such as assigned leads, their own activities, and their own email records.

Environment Variables
Backend .env example:

PORT=5000
DATABASE_URL="mysql://root:@localhost:3306/leadflow_crm"
JWT_SECRET="temporary_signing_secret_for_jwt_leadflow"
Future SMTP setup example:

SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_google_app_password"
SMTP_FROM_NAME="LeadFlow CRM"
SMTP is currently pending final decision.

Common Commands
Backend
cd backend
npm install
npm run dev
Frontend
cd frontend
npm install
npm run dev
Prisma
cd backend
npx prisma generate
npx prisma migrate dev
npx prisma db seed
Production Notes
For production deployment:

Use a hosted MySQL database instead of local XAMPP.
Set real environment variables on the server.
Build the frontend using:
cd frontend
npm run build
Deploy the backend on a Node.js hosting/server.
PM2 can be used later to keep the backend running continuously.
SMTP/email provider should be configured after final decision.
External Services
Currently required:

XAMPP MySQL
phpMyAdmin
Prisma ORM
Node.js
Vite development server
Not currently used:

Cron job
PM2
SMTP provider
Cloud storage
Payment gateway
Notes for Deployment
XAMPP is only used for local development. For production, use a proper hosted MySQL database and server environment.

Before deployment, make sure:

1. Backend .env is configured.
2. Database is imported or migrated.
3. Prisma Client is generated.
4. Frontend API URLs point to the deployed backend.
5. SMTP provider is finalized if email sending is required.
