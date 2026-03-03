'use server'
import { prisma } from "../lib/prisma"
export  async function New_User(formData: FormData){
    await prisma.utilisateur.create({
        data:{
            nom: formData.get('fn') as String,
            email: formData.get('en'),
            prenom:formData.get('ln'),
            mot_de_passe:formData.get('pass'),
        }
    })
}