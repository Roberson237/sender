import { prisma } from "../../../lib/prisma";
import { put } from '@vercel/blob';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        console.log('POST /api/new_file called');
        
        const formData = await request.formData();
        const file = formData.get('file');
        
        if (!file) {
            return NextResponse.json(
                { success: false, error: 'Aucun fichier fourni' },
                { status: 400 }
            );
        }

        const blob = await put(file.name, file, {
            access: 'public',
            addRandomSuffix: true,  // ✅ évite les conflits de noms
        });

        console.log('Fichier uploadé vers Blob:', blob.url);

        const password = formData.get('password') || '';
        const expirationDays = formData.get('expiration') 
            ? parseInt(formData.get('expiration')) 
            : 7;

        const fichier = await prisma.fichier.create({
            data: {
                nom: file.name,
                chemin: blob.url,
                taille: file.size.toString(),
                type: file.type,
                date_upload: new Date(),
            }
        });

        console.log('Fichier enregistré en DB:', fichier.id);

        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
        const baseUrl = `${protocol}://${host}`;
        const shareUrl = `${baseUrl}/share/${fichier.id}`;

        let hashedPassword = null;
        if (password.trim()) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const expirationDate = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);

        await prisma.lienPartage.create({
            data: {
                url: shareUrl,
                code_access: hashedPassword,
                expiration: expirationDate,
                fichier_id: fichier.id,
            }
        });

        return NextResponse.json(
            {
                success: true,
                shareUrl: shareUrl,
                fileId: fichier.id,
                blobUrl: blob.url,
                message: 'Fichier sauvegardé avec succès'
            },
            { status: 200 }
        );
        
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du fichier:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                details: error.code || 'No error code'
            },
            { status: 500 }
        );
    }
}