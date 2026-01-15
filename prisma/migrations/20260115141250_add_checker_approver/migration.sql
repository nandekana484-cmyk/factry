/*
  Warnings:

  - Added the required column `approver_id` to the `approval_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `checker_id` to the `approval_requests` table without a default value. This is not possible if the table is not empty.

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
-- 既存データにchecker_idとapprover_idを割り当て（既存データには適当にrequester_idを使用）
INSERT INTO "new_approval_requests" ("comment", "document_id", "id", "requested_at", "requester_id", "checker_id", "approver_id") 
SELECT "comment", "document_id", "id", "requested_at", "requester_id", "requester_id", "requester_id" FROM "approval_requests";
DROP TABLE "approval_requests";
ALTER TABLE "new_approval_requests" RENAME TO "approval_requests";
CREATE UNIQUE INDEX "approval_requests_document_id_key" ON "approval_requests"("document_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
