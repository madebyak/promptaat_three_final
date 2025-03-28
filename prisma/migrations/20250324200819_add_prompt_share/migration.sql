-- CreateTable
CREATE TABLE "prompt_shares" (
    "id" TEXT NOT NULL,
    "prompt_id" TEXT NOT NULL,
    "user_id" TEXT,
    "share_token" TEXT NOT NULL,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "platform" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "prompt_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prompt_shares_share_token_key" ON "prompt_shares"("share_token");

-- AddForeignKey
ALTER TABLE "prompt_shares" ADD CONSTRAINT "prompt_shares_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_shares" ADD CONSTRAINT "prompt_shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
