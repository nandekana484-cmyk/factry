/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `folders` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "folders_code_key" ON "folders"("code");
