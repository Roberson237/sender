/*
  Warnings:

  - You are about to drop the column `utilisateur_id` on the `fichiers` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `fichiers` DROP FOREIGN KEY `fichiers_utilisateur_id_fkey`;

-- AlterTable
ALTER TABLE `fichiers` DROP COLUMN `utilisateur_id`,
    MODIFY `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `liens_partage` MODIFY `updatedAt` DATETIME(3) NULL;
