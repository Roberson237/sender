import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const password = searchParams.get('password')?.trim();

        const fichier = await prisma.fichier.findUnique({
            where: { id: parseInt(id) },
            include: {
                liensPartage: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        if (!fichier) {
            return NextResponse.json(
                { success: false, error: 'Fichier non trouvé' },
                { status: 404 }
            );
        }

        if (!fichier.liensPartage || fichier.liensPartage.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Aucun lien de partage disponible' },
                { status: 404 }
            );
        }

        const lienPartage = fichier.liensPartage[0];

        // Vérification expiration
        if (lienPartage.expiration < new Date()) {
            return NextResponse.json(
                { success: false, error: 'Lien expiré' },
                { status: 410 }
            );
        }

        // Vérification mot de passe ✅ vérifie null ET chaîne vide
        if (lienPartage.code_access && lienPartage.code_access.trim() !== '') {
            if (!password) {
                return NextResponse.json(
                    { success: false, error: 'Mot de passe requis' },
                    { status: 401 }
                );
            }

            const isValidPassword = await bcrypt.compare(password, lienPartage.code_access);
            if (!isValidPassword) {
                return NextResponse.json(
                    { success: false, error: 'Mot de passe incorrect' },
                    { status: 401 }
                );
            }
        }

        // ✅ fichier.chemin est une URL Vercel Blob
        const blobResponse = await fetch(fichier.chemin);

        if (!blobResponse.ok) {
            return NextResponse.json(
                { success: false, error: 'Fichier introuvable sur le serveur' },
                { status: 404 }
            );
        }

        const fileBuffer = await blobResponse.arrayBuffer();

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': fichier.type || 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${encodeURIComponent(fichier.nom)}"`,
                'Content-Length': fileBuffer.byteLength.toString(),
            },
        });

    } catch (error) {
        console.error('ERREUR COMPLÈTE:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}