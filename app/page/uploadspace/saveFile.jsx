'use server'

import { prisma } from "../../../lib/prisma";
import { put } from '@vercel/blob';
import bcrypt from 'bcryptjs';

export async function Savefile(formData) {
    try {
        console.log('Savefile called');

        const file = formData.get('file');
        if (!file) {
            throw new Error('Aucun fichier fourni');
        }

        // ✅ Upload vers Vercel Blob au lieu de fs
        const blob = await put(file.name, file, {
            access: 'public',
        });

        const password = formData.get('password') || '';
        const expirationDays = formData.get('expiration')
            ? parseInt(formData.get('expiration'))
            : 7;

        // ✅ On capture le résultat dans "fichier"
        const fichier = await prisma.fichiers.create({
            data: {
                nom: file.name,
                chemin: blob.url,   // URL Vercel Blob au lieu du chemin local
                taille: file.size,
                type: file.type,
                date_upload: new Date(),
            }
        });

        const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${fichier.id}`;
        const hashedPassword = await bcrypt.hash(password, 10);
        const now = new Date();

        await prisma.lienPartage.create({
            data: {
                url: shareUrl,
                code_access: hashedPassword,
                expiration: expirationDays,
                fichier_id: fichier.id,
                createdAt: now.toISOString().slice(0, 19).replace('T', ' '),
                // ✅ expirationDays au lieu de expiration
                updatedAt: new Date(now.getTime() + expirationDays * 24 * 60 * 60 * 1000)
                    .toISOString().slice(0, 19).replace('T', ' '),
            }
        });

        return {
            success: true,
            shareUrl: shareUrl,
            fileId: fichier.id,
            message: 'Fichier sauvegardé avec succès'
        };

    } catch (error) {
        console.error('Erreur lors de la sauvegarde du fichier:', error);
        return {
            success: false,
            error: error.message,
        };
    }
}