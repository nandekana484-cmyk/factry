-- AlterTable
ALTER TABLE "documents" ADD COLUMN "management_number" TEXT;

-- CreateTable
CREATE TABLE "revision_history" (
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
    CONSTRAINT "revision_history_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
