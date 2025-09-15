/*
  Warnings:

  - Added the required column `createdBy` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "express"."Group" ADD COLUMN     "createdBy" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "express"."Group" ADD CONSTRAINT "Group_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "express"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
