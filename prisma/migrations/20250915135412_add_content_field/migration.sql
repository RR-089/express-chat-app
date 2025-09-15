/*
  Warnings:

  - Added the required column `content` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "express"."Message" ADD COLUMN     "content" TEXT NOT NULL;
