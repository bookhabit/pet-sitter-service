-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT IF EXISTS "ChatMessage_chat_room_id_fkey";
ALTER TABLE "ChatMessage" DROP CONSTRAINT IF EXISTS "ChatMessage_sender_id_fkey";
ALTER TABLE "ChatRoom" DROP CONSTRAINT IF EXISTS "ChatRoom_job_id_fkey";
ALTER TABLE "ChatRoom" DROP CONSTRAINT IF EXISTS "ChatRoom_participant1_id_fkey";
ALTER TABLE "ChatRoom" DROP CONSTRAINT IF EXISTS "ChatRoom_participant2_id_fkey";

-- DropIndex
DROP INDEX IF EXISTS "ChatRoom_participant1_id_idx";
DROP INDEX IF EXISTS "ChatRoom_participant1_id_participant2_id_job_id_key";
DROP INDEX IF EXISTS "ChatRoom_participant2_id_idx";

-- AlterTable
ALTER TABLE "ChatRoom" DROP COLUMN IF EXISTS "job_id",
DROP COLUMN IF EXISTS "participant1_id",
DROP COLUMN IF EXISTS "participant2_id",
DROP COLUMN IF EXISTS "updatedAt",
ADD COLUMN "job_application_id" TEXT NOT NULL;

-- DropTable
DROP TABLE IF EXISTS "ChatMessage";

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "chat_room_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatRoomRead" (
    "id" TEXT NOT NULL,
    "chat_room_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "last_read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatRoomRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatRoomRead_chat_room_id_user_id_key" ON "ChatRoomRead"("chat_room_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ChatRoom_job_application_id_key" ON "ChatRoom"("job_application_id");

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_job_application_id_fkey" FOREIGN KEY ("job_application_id") REFERENCES "JobApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chat_room_id_fkey" FOREIGN KEY ("chat_room_id") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoomRead" ADD CONSTRAINT "ChatRoomRead_chat_room_id_fkey" FOREIGN KEY ("chat_room_id") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoomRead" ADD CONSTRAINT "ChatRoomRead_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
