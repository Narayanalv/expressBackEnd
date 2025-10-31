/*
  Warnings:

  - You are about to drop the column `action` on the `UserFav` table. All the data in the column will be lost.
  - Made the column `image` on table `UserFav` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `UserFav` DROP COLUMN `action`,
    MODIFY `image` VARCHAR(300) NOT NULL;
