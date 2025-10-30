# 🏦 Loan Management System – Full Roadmap & Build Prompt

### Overview
This Loan Management Tool helps a community organization keep track of small loans it gives to local businesses or individuals.

It should:
- Record who got the loan, how much, and when they must pay it back.  
- Track payments and show who is behind or up to date.  
- Generate simple reports (totals lent, paid back, overdue).  
- Provide AI insights (risk predictions, impact tracking, reminders).

---

## 🚀 Tech Stack

### Frontend
- **React + TypeScript (Next.js)**
- **Tailwind CSS + shadcn/ui**
- **GSAP** (for animations)
- **Auth0** (authentication)
- **React Query** (API state management)
- **Recharts or Chart.js** (data visualization)
- **Lucide Icons** (icons)

### Backend
- **Node.js + TypeScript**
- **SQL LIGHT **
- **Fastify** (or Express)
- **Prisma ORM**
- **PostgreSQL** (SQLite for local/dev)
- **Auth0** middleware for roles (Admin, Volunteer)
- **BullMQ + Redis** (for background jobs & reminders)
- **SendGrid** (email) / **Twilio** (SMS)
- **OpenAI / Claude API** (for AI analytics and risk scoring)
- **pgvector** (for embeddings and AI insights)
- **Pino + Sentry** (logging and monitoring)

### DevOps
- **GitHub Actions** (CI/CD)
- **Vercel** (frontend deploy)

- **.env Management** (for secrets)
- **ESLint + Prettier + Husky** (code quality)

---

## 📅 Roadmap (Phased Implementation)

### Phase 1: Project Setup
- Initialize repo with TypeScript, ESLint, Prettier, and Husky.
- Set up monorepo (optional) with:


/apps/frontend
/apps/backend
/packages/common

- Configure Tailwind + shadcn + GSAP in frontend.
- Initialize Prisma + database connection.

### Phase 2: Database Schema
Create Prisma models for:
- **User**
- **Borrower**
- **Loan**
- **Payment**
- **AuditLog**

```prisma
model User {
id        String   @id @default(uuid())
email     String   @unique
name      String?
role      UserRole
createdAt DateTime @default(now())
}

enum UserRole {
ADMIN
VOLUNTEER
}

model Borrower {
id        String   @id @default(uuid())
name      String
contact   String?
email     String?
address   String?
notes     String?
createdAt DateTime @default(now())
loans     Loan[]
}

model Loan {
id           String     @id @default(uuid())
borrowerId   String
borrower     Borrower   @relation(fields: [borrowerId], references: [id])
principal    Decimal
interestRate Float?
issuedAt     DateTime
dueDate      DateTime
status       LoanStatus @default(ACTIVE)
createdAt    DateTime   @default(now())
payments     Payment[]
metadata     Json?
}

enum LoanStatus {
ACTIVE
PAID
DEFAULTED
WRITE_OFF
}

model Payment {
id        String   @id @default(uuid())
loanId    String
loan      Loan     @relation(fields: [loanId], references: [id])
amount    Decimal
paidAt    DateTime @default(now())
notes     String?
method    String?
createdAt DateTime @default(now())
}

model AuditLog {
id        String   @id @default(uuid())
actorId   String?
action    String
payload   Json?
createdAt DateTime @default(now())
}


Phase 3: Backend Development

Framework: Fastify + Prisma

Core Endpoints:

GET /api/health
GET /api/borrowers
POST /api/borrowers
PATCH /api/borrowers/:id
DELETE /api/borrowers/:id
GET /api/loans
POST /api/loans
PATCH /api/loans/:id
POST /api/loans/:id/payments
GET /api/loans/:id/payments
GET /api/reports/summary
GET /api/reports/export?type=csv|pdf
POST /api/reminders/schedule
POST /api/ai/risk-score


Core features:

CRUD for borrowers, loans, and payments.

Loan balance auto-calculation.

Role-based access (Auth0).

CSV/PDF export.

AI risk analysis endpoint.

Phase 4: Frontend Dashboard

Pages:

/login — Auth0 login

/dashboard — Overview (totals, overdue, recent payments)

/borrowers — Borrower list + CRUD

/loans — Loan list + CRUD + payments

/reports — Summary reports + AI insights

Dashboard Widgets:

Total money lent

Total repaid

Total overdue

Borrowers behind schedule

Risk flags (AI)

Quick actions (Add borrower, Add loan)

Phase 5: Background Jobs & Notifications

Cron job checks for upcoming and overdue loans daily.

Sends email/SMS reminders using Twilio/SendGrid.

Stores reminder history in database.


Phase 6: AI Insights
Risk Scoring Prompt Example
{
  "borrower": { "name": "John Doe", "pastRepayments": 2, "latePaymentsCount": 1 },
  "loan": { "principal": 5000.00, "interestRate": 5.0, "dueDate": "2026-01-10" },
  "payments": [ { "amount": 1000.00, "paidAt": "2025-11-10" } ]
}

You are a financial risk evaluator. 
Given borrower and loan data, return a JSON object:
{
  "risk_score": 0-100,
  "reasons": ["..."],
  "actions": ["..."]
}
Prompt:

You are a financial risk evaluator. 
Given borrower and loan data, return a JSON object:
{
  "risk_score": 0-100,
  "reasons": ["..."],
  "actions": ["..."]
}

Input: summary statistics (total_loans, total_repaid, overdue_count, avg_loan_size)
Task: Write a plain-language report (2 paragraphs + 2 management suggestions)

Portfolio Report Prompt Example
Input: summary statistics (total_loans, total_repaid, overdue_count, avg_loan_size)
Task: Write a plain-language report (2 paragraphs + 2 management suggestions)



Phase 7: Testing & Deployment

Unit tests (loan balance, overdue detection)

Integration tests for CRUD endpoints

CI/CD with GitHub Actions

Deploy:

Frontend → Vercel

Backend → Render

Database → Sql light / 