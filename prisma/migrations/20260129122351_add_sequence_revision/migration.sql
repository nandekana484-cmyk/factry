/*
  Warnings:

  - You are about to drop the column `management_number` on the `documents` table. All the data in the column will be lost.
  - Added the required column `sequence` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Made the column `folder_id` on table `documents` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_documents" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "creator_id" INTEGER NOT NULL,
    "template_id" INTEGER,
    "folder_id" INTEGER NOT NULL,
    "document_type_id" INTEGER,
    "sequence" INTEGER NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "documents_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "documents_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "documents_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "document_types" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_documents" ("created_at", "creator_id", "document_type_id", "folder_id", "id", "status", "template_id", "title", "updated_at", "sequence", "revision")
SELECT "created_at", "creator_id", "document_type_id", COALESCE("folder_id", 1), "id", "status", "template_id", "title", "updated_at", 1, 0 FROM "documents";
DROP TABLE "documents";
ALTER TABLE "new_documents" RENAME TO "documents";
CREATE UNIQUE INDEX "documents_folder_id_sequence_key" ON "documents"("folder_id", "sequence");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
