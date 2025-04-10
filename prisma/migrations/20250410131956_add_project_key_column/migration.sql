/*
  Warnings:

  - Added the required column `project_key` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "project_key" TEXT NOT NULL;
