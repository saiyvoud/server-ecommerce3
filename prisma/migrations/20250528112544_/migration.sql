/*
  Warnings:

  - Added the required column `image` to the `Banner` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Banner` ADD COLUMN `image` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `bill` VARCHAR(191) NULL;
