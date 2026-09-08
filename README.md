# 🎓 University Management System — Backend

A RESTful backend API for managing a university's academic and administrative operations. The system provides role-based access for administrators, instructors, and students, with modules for semesters, courses, enrollments, attendance, examinations, payments, notifications, and authentication.

This repository contains the **backend API** of the University Management System.

---

## 🚀 Features

### 🔐 Authentication & Authorization

* User registration and login
* JWT-based authentication
* Role-based authorization
* Protected routes
* User profile management
* Multiple user roles:

  * `SUPER_ADMIN`
  * `DEPARTMENT_ADMIN`
  * `INSTRUCTOR`
  * `STUDENT`

### 👨‍🎓 Student Management

* Student profile management
* Student information retrieval
* Department and program association
* Semester enrollment
* Student fee management

### 👨‍🏫 Instructor Management

* Instructor application
* Instructor profile
* Department association
* Instructor verification/approval
* Instructor-related academic operations

### 📚 Academic Management

* Department management
* Program management
* Course management
* Semester management
* Course enrollment
* Section management
* Instructor assignment

### 📝 Attendance

* Record student attendance
* Attendance status:

  * `PRESENT`
  * `ABSENT`
  * `LATE`
  * `EXCUSED`
* View attendance records
* Update attendance records

### 🧪 Examination & Results

* Create examinations
* Set maximum marks
* Configure exam weightage
* Record student exam results
* Retrieve examination results

### 💳 Semester Registration & Payment

* Semester registration
* Student fee/invoice creation
* bKash payment integration
* Payment retry for unpaid invoices
* Payment callback handling
* Payment status tracking
* Transaction ID storage
* Payment receipt generation
* Email receipt delivery

### 🔔 Notifications

* Create notifications
* Retrieve user notifications
* Mark individual notifications as read
* Mark all notifications as read
* Delete notifications
* User-specific notification access

---

## 🛠️ Technology Stack

| Technology       | Purpose                      |
| ---------------- | ---------------------------- |
| **Node.js**      | Runtime                      |
| **Express.js 5** | REST API framework           |
| **TypeScript**   | Programming language         |
| **Prisma 7**     | ORM                          |
| **PostgreSQL**   | Database                     |
| **JWT**          | Authentication               |
| **Zod**          | Request validation           |
| **bcrypt**       | Password hashing             |
| **bKash API**    | Payment processing           |
| **Nodemailer**   | Email service                |
| **PDFKit**       | Payment receipt generation   |
| **Redis**        | OTP / temporary data storage |

---

## 📁 Project Structure

```text
University-Management-System/
│
├── src/
│   ├── server.ts
│   ├── app.ts
│   │
│   ├── generated/
│   │   └── prisma/
│   │
│   └── app/
│       │
│       ├── config/
│       │   └── index.ts
│       │
│       ├── lib/
│       │   ├── prisma.ts
│       │   ├── bkash.ts
│       │   └── nodemailer.ts
│       │
│       ├── middleware/
│       │   ├── checkAuth.ts
│       │   ├── validateRequest.ts
│       │   ├── globalErrorHandler.ts
│       │   └── notFound.ts
│       │
│       ├── utils/
│       │   ├── AppError.ts
│       │   ├── catchAsync.ts
│       │   ├── jwt.ts
│       │   └── sendResponse.ts
│       │
│       └── module/
│           │
│           ├── auth/
│           ├── user/
│           ├── student/
│           ├── instructor/
│           ├── department/
│           ├── program/
│           ├── course/
│           ├── enrollment/
│           ├── semester/
│           ├── section/
│           ├── attendance/
│           ├── exam/
│           ├── result/
│           ├── payment/
│           └── notification/
│
├── prisma/
│   ├── schema/
│   │   ├── schema.prisma
│   │   ├── user.prisma
│   │   ├── student.prisma
│   │   ├── instructor.prisma
│   │   ├── department.prisma
│   │   ├── program.prisma
│   │   ├── course.prisma
│   │   ├── semester.prisma
│   │   └── enums.prisma
│   │
│   └── migrations/
│
├── .env.example
├── prisma.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

> The exact module list may change as development continues.

---

# 🗄️ Database

The application uses **PostgreSQL** with **Prisma ORM**.

The database contains entities such as:

```text
User
 │
 ├── Student
 │
 └── Instructor

Department
 │
 ├── Program
 │
 ├── Student
 │
 └── Instructor

Program
 │
 └── Student

Semester
 │
 ├── CourseEnrollment
 │
 └── StudentFee

Course
 │
 ├── CourseEnrollment
 │
 └── Section

Section
 │
 ├── Attendance
 │
 └── Exam

Exam
 │
 └── ExamResult

User
 │
 └── Notification
```

---

# 🔑 Authentication

The API uses **JWT-based authentication**.

After successful login, the server provides an access token that should be sent with protected requests.

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

The authentication middleware verifies:

1. JWT signature
2. User identity
3. User role
4. Account status

---

# 👥 User Roles

### SUPER_ADMIN

Responsible for system-wide administration.

Typical permissions include:

* Manage departments
* Manage programs
* Manage users
* Manage semesters
* Manage academic configuration

### DEPARTMENT_ADMIN

Responsible for department-level administration.

Typical permissions include:

* Manage department resources
* Manage instructors
* Manage courses
* Manage sections
* Manage semesters within the department

### INSTRUCTOR

Responsible for academic activities.

Typical permissions include:

* Manage assigned sections
* Record attendance
* Create examinations
* Enter examination results

### STUDENT

Responsible for student activities.

Typical permissions include:

* View profile
* Enroll in courses
* Register for semesters
* Make registration payments
* View attendance
* View examination results
* View notifications

---

# 📡 API

Base URL:

```text
http://localhost:5000/api
```

The API is organized into feature-based modules.

Example endpoints:

### Authentication

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh-token
GET    /api/auth/me
```

### Semester

```text
POST   /api/semester/create-semester
GET    /api/semester
GET    /api/semester/:semesterId
PATCH  /api/semester/:semesterId
DELETE /api/semester/:semesterId
```

### Semester Registration

```text
POST /api/semester/initiate
POST /api/semester/retry-payment
GET  /api/semester/payment/callback
```

### Notifications

```text
POST   /api/notifications
GET    /api/notifications
GET    /api/notifications/:notificationId
PATCH  /api/notifications/:notificationId
PATCH  /api/notifications/:notificationId/read
PATCH  /api/notifications/read-all
DELETE /api/notifications/:notificationId
```

> Endpoint names can vary depending on the route configuration in the current version of the project.

---

# 💳 bKash Payment Flow

Semester registration payments use the bKash payment gateway.

The general flow is:

```text
Student
   │
   ▼
Semester Registration
   │
   ▼
Create Student Fee
   │
   ▼
Create bKash Checkout
   │
   ▼
Student completes payment
   │
   ▼
bKash Callback
   │
   ▼
Execute Payment
   │
   ▼
Verify Payment
   │
   ▼
Update StudentFee
   │
   ├── PAID
   │
   └── Store Transaction ID
   │
   ▼
Generate Receipt
   │
   ▼
Send Receipt by Email
```

For an unpaid invoice, the student can use the retry-payment endpoint instead of creating another invoice.

---

# 🔔 Notification System

Notifications are associated with individual users.

Example Prisma model:

```prisma
model Notification {
  id        String   @id @default(uuid())
  title     String
  message   String
  isRead    Boolean  @default(false)
  userId    String
  createdAt DateTime @default(now())

  user User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )

  @@map("notification")
}
```

A notification can be used for events such as:

* Semester registration
* Successful payment
* Exam result publication
* Attendance updates
* Course enrollment
* Administrative announcements

---

# ⚙️ Prerequisites

Make sure the following are installed:

* Node.js 20+
* PostgreSQL
* npm / pnpm / yarn
* Git

Check your versions:

```bash
node -v
npm -v
psql --version
```

---

# 📥 Installation

Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
```

Navigate into the project:

```bash
cd University-Management-System
```

Install dependencies:

```bash
npm install
```

---

# 🔐 Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Example configuration:

```env
NODE_ENV=development
PORT=5000

DATABASE_URL="postgresql://postgres:password@localhost:5432/university_management?schema=public"

JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

BCRYPT_SALT_ROUNDS=10

FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:5000"

# bKash
BKASH_BASE_URL=""
BKASH_APP_KEY=""
BKASH_APP_SECRET=""
BKASH_USERNAME=""
BKASH_PASSWORD=""
BKASH_CALLBACK_URL=""

# Email
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""

# Redis
REDIS_URL=""
```

**Never commit your `.env` file to GitHub.**

---

# 🧬 Prisma Setup

Generate the Prisma client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

If you want to inspect your database:

```bash
npx prisma studio
```

Prisma Studio normally opens at:

```text
http://localhost:5555
```

---

# ▶️ Run the Project

Development mode:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Start the application:

```bash
npm run start
```

The development server should be available at:

```text
http://localhost:5000
```

---

# ❤️ Health Check

After starting the server, open:

```text
http://localhost:5000/
```

Expected response:

```json
{
  "success": true,
  "message": "Welcome to University Management System Backend"
}
```

---

# 📦 Standard API Response

Successful responses follow a common format:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Data retrieved successfully.",
  "data": {}
}
```

Error responses are handled by the global error handler.

Example:

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Student not found."
}
```

---

# 🧩 Module Architecture

Each feature follows the same structure:

```text
module/
└── feature/
    ├── feature.route.ts
    ├── feature.controller.ts
    ├── feature.service.ts
    ├── feature.interface.ts
    └── feature.validation.ts
```

### Route

Responsible for:

* Defining endpoints
* Authentication
* Authorization
* Request validation

### Controller

Responsible for:

* Reading request data
* Calling services
* Sending responses

### Service

Responsible for:

* Business logic
* Prisma queries
* Database operations

### Interface

Responsible for:

* TypeScript interfaces
* Payload types

### Validation

Responsible for:

* Zod request validation
* Input constraints

---

# 🛡️ Development Principles

The project follows several architectural rules:

### Controllers should not access Prisma directly

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Prisma
  ↓
PostgreSQL
```

### Services should not access Express request/response objects

Instead of passing the complete request:

```ts
service(req)
```

pass only the required user information:

```ts
service(payload, user)
```

For example:

```ts
{
  userId,
  email,
  name,
  role
}
```

### Don't blindly spread request bodies

Avoid:

```ts
prisma.user.create({
  data: {
    ...req.body
  }
});
```

Instead explicitly select fields:

```ts
const { name, email, password } = req.body;

prisma.user.create({
  data: {
    name,
    email,
    password
  }
});
```

---

# 🗂️ Useful Prisma Commands

Generate Prisma Client:

```bash
npx prisma generate
```

Create and apply migration:

```bash
npx prisma migrate dev --name your_migration_name
```

Open Prisma Studio:

```bash
npx prisma studio
```

Check migration status:

```bash
npx prisma migrate status
```

---

# 🐛 Troubleshooting

### Prisma Client not found

If you see:

```text
Cannot find module .../generated/prisma
```

run:

```bash
npx prisma generate
```

---

### Database connection error

Check that PostgreSQL is running.

Then verify:

```env
DATABASE_URL="postgresql://..."
```

You can also test PostgreSQL:

```bash
pg_isready
```

---

### JWT errors

Check:

```env
JWT_ACCESS_SECRET="..."
JWT_REFRESH_SECRET="..."
```

Both values must exist before authentication can work correctly.

---

### Migration problems

Check migration status:

```bash
npx prisma migrate status
```

Then inspect the Prisma schema and database before creating another migration.

---

# 🔒 Security

For production deployment:

* Use strong JWT secrets
* Never commit `.env`
* Use HTTPS
* Configure secure cookies
* Validate every request
* Restrict CORS origins
* Use strong database credentials
* Keep dependencies updated
* Verify payment callbacks server-side
* Never trust payment status supplied only by the client

Generate a strong secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

# 🧪 Testing

Testing is currently under development.

API testing can be performed using:

* Postman
* Insomnia
* cURL

Example:

```bash
curl http://localhost:5000/
```

---

# 🚧 Project Status

The project is actively under development.

### Completed / In Progress

* [x] Authentication
* [x] JWT authorization
* [x] User management
* [x] Student management
* [x] Instructor management
* [x] Department management
* [x] Program management
* [x] Course management
* [x] Semester management
* [x] Course enrollment
* [x] Section management
* [x] Attendance
* [x] Examination
* [x] Exam results
* [x] Semester registration
* [x] bKash payment integration
* [x] Payment retry
* [x] Notification system
* [ ] Comprehensive automated tests
* [ ] Production deployment
* [ ] API documentation / Swagger
* [ ] Advanced reporting

> Update the checklist as features are completed.

---

# 🔮 Future Improvements

Planned improvements include:

* Swagger / OpenAPI documentation
* Automated unit and integration tests
* Pagination and filtering across all list APIs
* Advanced student performance reports
* Result/grade calculation
* Attendance percentage calculation
* Email notifications
* Real-time notifications
* Admin dashboard APIs
* Audit logging
* Improved payment reconciliation
* Production deployment with Docker
* CI/CD pipeline

---

# 👨‍💻 Author

**Shamsuzzaman Shams**

Backend / Full-Stack Developer

### Technologies

```text
Node.js
TypeScript
Express.js
Prisma
PostgreSQL
JWT
Next.js
React
```

---

# 📄 License

This project is developed for educational and academic purposes.
