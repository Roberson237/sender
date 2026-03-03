/*
  Warnings:

  - Added the required column `prenom` to the `utilisateurs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `utilisateurs` ADD COLUMN `prenom` VARCHAR(191) NOT NULL;
