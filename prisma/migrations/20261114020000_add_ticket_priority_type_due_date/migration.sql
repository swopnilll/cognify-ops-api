-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('task', 'bug', 'story');

-- AlterTable: existing tickets become medium-priority tasks with no due date
ALTER TABLE "Ticket"
    ADD COLUMN "priority" "TicketPriority" NOT NULL DEFAULT 'medium',
    ADD COLUMN "type" "TicketType" NOT NULL DEFAULT 'task',
    ADD COLUMN "due_date" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Ticket_project_id_idx" ON "Ticket"("project_id");
