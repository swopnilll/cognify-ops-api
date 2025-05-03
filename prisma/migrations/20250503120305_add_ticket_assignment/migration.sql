-- CreateTable
CREATE TABLE "Ticket_Assignment" (
    "ticket_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "Ticket_Assignment_pkey" PRIMARY KEY ("ticket_id")
);

-- CreateIndex
CREATE INDEX "Ticket_Assignment_user_id_idx" ON "Ticket_Assignment"("user_id");

-- AddForeignKey
ALTER TABLE "Ticket_Assignment" ADD CONSTRAINT "Ticket_Assignment_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "Ticket"("ticket_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket_Assignment" ADD CONSTRAINT "Ticket_Assignment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
