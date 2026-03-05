'use server'
import { prisma } from "../lib/prisma"
export  async function New_User(formData: FormData){
    const nom = formData.get('fn') as string;
    const email = formData.get('en') as string;
    const prenom = formData.get('ln') as string;
    const mot_de_passe = formData.get('pass') as string;

    await prisma.utilisateur.create({
        data:{
            nom,
            email,
            prenom,
            mot_de_passe,
        }
    })
}