/*
  Warnings:

  - Made the column `checker_id` on table `approval_requests` required. This step will fail if there are existing NULL values in that column.
  - Made the column `checked_by_id` on table `revision_history` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_approval_requests" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "document_id" INTEGER NOT NULL,
    "requester_id" INTEGER NOT NULL,
    "checker_id" INTEGER NOT NULL,
    "approver_id" INTEGER NOT NULL,
    "requested_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comment" TEXT,
    CONSTRAINT "approval_requests_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "approval_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "approval_requests_checker_id_fkey" FOREIGN KEY ("checker_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "approval_requests_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_approval_requests" ("approver_id", "checker_id", "comment", "document_id", "id", "requested_at", "requester_id") SELECT "approver_id", "checker_id", "comment", "document_id", "id", "requested_at", "requester_id" FROM "approval_requests";
DROP TABLE "approval_requests";
ALTER TABLE "new_approval_requests" RENAME TO "approval_requests";
CREATE UNIQUE INDEX "approval_requests_document_id_key" ON "approval_requests"("document_id");
CREATE TABLE "new_revision_history" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "document_id" INTEGER NOT NULL,
    "management_number" TEXT NOT NULL,
    "revision_symbol" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "approved_by_id" INTEGER,
    "checked_by_id" INTEGER NOT NULL,
    "created_by_id" INTEGER NOT NULL,
    "approved_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "revision_history_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "revision_history_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "revision_history_checked_by_id_fkey" FOREIGN KEY ("checked_by_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "revision_history_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_revision_history" ("approved_at", "approved_by_id", "checked_by_id", "created_at", "created_by_id", "document_id", "id", "management_number", "revision_symbol", "title") SELECT "approved_at", "approved_by_id", "checked_by_id", "created_at", "created_by_id", "document_id", "id", "management_number", "revision_symbol", "title" FROM "revision_history";
DROP TABLE "revision_history";
ALTER TABLE "new_revision_history" RENAME TO "revision_history";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
