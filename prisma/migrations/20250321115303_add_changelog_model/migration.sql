-- CreateTable
CREATE TABLE "changelogs" (
    "id" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "content_en" TEXT NOT NULL,
    "content_ar" TEXT NOT NULL,
    "image_url" TEXT,
    "author_id" TEXT NOT NULL,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "changelogs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "changelogs" ADD CONSTRAINT "changelogs_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
