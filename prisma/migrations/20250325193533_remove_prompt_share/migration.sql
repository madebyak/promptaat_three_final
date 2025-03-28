/*
  Warnings:

  - You are about to drop the `prompt_shares` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "prompt_shares" DROP CONSTRAINT "prompt_shares_prompt_id_fkey";

-- DropForeignKey
ALTER TABLE "prompt_shares" DROP CONSTRAINT "prompt_shares_user_id_fkey";

-- DropTable
DROP TABLE "prompt_shares";
