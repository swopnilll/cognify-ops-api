-- AlterTable: users now sign in with an email and password stored here
ALTER TABLE "User"
    ADD COLUMN "email" TEXT,
    ADD COLUMN "password_hash" TEXT,
    ADD COLUMN "full_name" TEXT,
    ADD COLUMN "picture" TEXT,
    ADD COLUMN "last_login" TIMESTAMP(3),
    ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
