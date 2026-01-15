-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_revision_history" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "document_id" INTEGER NOT NULL,
    "management_number" TEXT NOT NULL,
    "revision_symbol" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "approved_by_id" INTEGER,
    "checked_by_id" INTEGER,
    "created_by_id" INTEGER NOT NULL,
    "approved_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "revision_history_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "revision_history_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "revision_history_checked_by_id_fkey" FOREIGN KEY ("checked_by_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "revision_history_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_revision_history" ("approved_at", "approved_by_id", "checked_by_id", "created_at", "created_by_id", "document_id", "id", "management_number", "revision_symbol", "title") SELECT "approved_at", "approved_by_id", "checked_by_id", "created_at", "created_by_id", "document_id", "id", "management_number", "revision_symbol", "title" FROM "revision_history";
DROP TABLE "revision_history";
ALTER TABLE "new_revision_history" RENAME TO "revision_history";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
