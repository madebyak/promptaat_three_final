/*
  Warnings:

  - You are about to drop the column `description` on the `catalogs` table. All the data in the column will be lost.
  - You are about to drop the column `is_default` on the `catalogs` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `prompts` table. All the data in the column will be lost.
  - You are about to drop the column `content_ar` on the `prompts` table. All the data in the column will be lost.
  - You are about to drop the column `content_en` on the `prompts` table. All the data in the column will be lost.
  - You are about to drop the column `copies` on the `prompts` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `prompts` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `prompts` table. All the data in the column will be lost.
  - You are about to drop the column `tool_id` on the `prompts` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `prompts` table. All the data in the column will be lost.
  - You are about to drop the column `views` on the `prompts` table. All the data in the column will be lost.
  - You are about to drop the column `plan_type` on the `subscriptions` table. All the data in the column will be lost.
  - The primary key for the `user_history` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `action` on the `user_history` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `user_history` table. All the data in the column will be lost.
  - Added the required column `prompt_text_ar` to the `prompts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prompt_text_en` to the `prompts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plan_id` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "prompts" DROP CONSTRAINT "prompts_category_id_fkey";

-- DropForeignKey
ALTER TABLE "prompts" DROP CONSTRAINT "prompts_tool_id_fkey";

-- DropForeignKey
ALTER TABLE "prompts" DROP CONSTRAINT "prompts_user_id_fkey";

-- AlterTable
ALTER TABLE "catalogs" DROP COLUMN "description",
DROP COLUMN "is_default";

-- AlterTable
ALTER TABLE "prompts" DROP COLUMN "category_id",
DROP COLUMN "content_ar",
DROP COLUMN "content_en",
DROP COLUMN "copies",
DROP COLUMN "rating",
DROP COLUMN "status",
DROP COLUMN "tool_id",
DROP COLUMN "user_id",
DROP COLUMN "views",
ADD COLUMN     "copy_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "description_ar" TEXT,
ADD COLUMN     "description_en" TEXT,
ADD COLUMN     "initial_copy_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "instruction_ar" TEXT,
ADD COLUMN     "instruction_en" TEXT,
ADD COLUMN     "prompt_text_ar" TEXT NOT NULL,
ADD COLUMN     "prompt_text_en" TEXT NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "plan_type",
ADD COLUMN     "plan_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user_history" DROP CONSTRAINT "user_history_pkey",
DROP COLUMN "action",
DROP COLUMN "id",
ADD CONSTRAINT "user_history_pkey" PRIMARY KEY ("user_id", "prompt_id");

-- CreateTable
CREATE TABLE "prompt_categories" (
    "prompt_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "subcategory_id" TEXT NOT NULL,

    CONSTRAINT "prompt_categories_pkey" PRIMARY KEY ("prompt_id","category_id","subcategory_id")
);

-- CreateTable
CREATE TABLE "prompt_tools" (
    "prompt_id" TEXT NOT NULL,
    "tool_id" TEXT NOT NULL,

    CONSTRAINT "prompt_tools_pkey" PRIMARY KEY ("prompt_id","tool_id")
);

-- CreateTable
CREATE TABLE "prompt_keywords" (
    "prompt_id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,

    CONSTRAINT "prompt_keywords_pkey" PRIMARY KEY ("prompt_id","keyword")
);

-- AddForeignKey
ALTER TABLE "prompt_categories" ADD CONSTRAINT "prompt_categories_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_categories" ADD CONSTRAINT "prompt_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_categories" ADD CONSTRAINT "prompt_categories_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_tools" ADD CONSTRAINT "prompt_tools_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_tools" ADD CONSTRAINT "prompt_tools_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_keywords" ADD CONSTRAINT "prompt_keywords_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
