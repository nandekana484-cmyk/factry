-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_approval_requests" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "document_id" INTEGER NOT NULL,
    "requester_id" INTEGER NOT NULL,
    "checker_id" INTEGER,
    "approver_id" INTEGER NOT NULL,
    "requested_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comment" TEXT,
    CONSTRAINT "approval_requests_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "approval_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "approval_requests_checker_id_fkey" FOREIGN KEY ("checker_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "approval_requests_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_approval_requests" ("approver_id", "checker_id", "comment", "document_id", "id", "requested_at", "requester_id") SELECT "approver_id", "checker_id", "comment", "document_id", "id", "requested_at", "requester_id" FROM "approval_requests";
DROP TABLE "approval_requests";
ALTER TABLE "new_approval_requests" RENAME TO "approval_requests";
CREATE UNIQUE INDEX "approval_requests_document_id_key" ON "approval_requests"("document_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
