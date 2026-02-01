/*
  Warnings:

  - Added the required column `first_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "department_id" INTEGER,
    "section_id" INTEGER,
    "position_id" INTEGER,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "last_name" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" DATETIME,
    CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "users_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "users_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Position" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
-- 既存nameを空白で分割し、姓・名・ミドルネームに割り当て（簡易）
INSERT INTO "new_users" (
  "created_at", "department_id", "disabled", "email", "id", "lastLogin", "name", "password", "position_id", "role", "section_id",
  "last_name", "first_name", "middle_name"
) 
SELECT 
  "created_at", "department_id", "disabled", "email", "id", "lastLogin", "name", "password", "position_id", "role", "section_id",
  -- last_name: nameの最初の単語
  trim(substr("name", 1, instr("name", ' ')-1)),
  -- first_name: nameの2番目の単語（なければ空）
  trim(
    CASE WHEN instr("name", ' ') > 0 
      THEN substr("name", instr("name", ' ')+1, instr(substr("name", instr("name", ' ')+1), ' ')-1)
      ELSE '' END
  ),
  -- middle_name: 3単語目以降を結合
  trim(
    CASE WHEN length("name")-length(replace("name", ' ', '')) >= 2 
      THEN substr("name", instr(substr("name", instr("name", ' ')+1), ' ')+instr("name", ' ')+1)
      ELSE NULL END
  )
FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_users_1" ON "users"("email");
Pragma writable_schema=0;
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
