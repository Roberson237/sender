-- AlterTable
ALTER TABLE `fichiers` ADD COLUMN `utilisateur_id` INTEGER NULL;

-- CreateIndex
CREATE INDEX `fichiers_utilisateur_id_fkey` ON `fichiers`(`utilisateur_id`);

-- AddForeignKey
ALTER TABLE `fichiers` ADD CONSTRAINT `fichiers_utilisateur_id_fkey` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
