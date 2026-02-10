-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploader_id" TEXT NOT NULL,
    "user_id" TEXT,
    "job_id" TEXT,
    "pet_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "Pet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
