-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LoanApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "employmentStatus" TEXT NOT NULL,
    "monthlyIncome" REAL NOT NULL,
    "loanAmount" REAL NOT NULL,
    "loanPurpose" TEXT NOT NULL,
    "documents" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "reviewNotes" TEXT,
    "conditionalApprovalNotes" TEXT,
    "requiredDocuments" TEXT,
    "signedDocuments" TEXT,
    "documentsSignedAt" DATETIME,
    "finalApprovedBy" TEXT,
    "finalApprovedAt" DATETIME,
    "disbursedBy" TEXT,
    "disbursedAt" DATETIME,
    "disbursementAmount" REAL,
    "disbursementMethod" TEXT,
    "disbursementReference" TEXT,
    "loanId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_LoanApplication" ("address", "createdAt", "documents", "email", "employmentStatus", "fullName", "id", "loanAmount", "loanPurpose", "monthlyIncome", "phone", "reviewNotes", "reviewedAt", "reviewedBy", "status", "updatedAt") SELECT "address", "createdAt", "documents", "email", "employmentStatus", "fullName", "id", "loanAmount", "loanPurpose", "monthlyIncome", "phone", "reviewNotes", "reviewedAt", "reviewedBy", "status", "updatedAt" FROM "LoanApplication";
DROP TABLE "LoanApplication";
ALTER TABLE "new_LoanApplication" RENAME TO "LoanApplication";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
