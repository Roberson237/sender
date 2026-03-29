'use server'
import { prisma } from "../lib/prisma"
export  async function New_User(formData: FormData){
    await prisma.utilisateur.create({
    data: {
        nom:          formData.get('fn')   as string,
        email:        formData.get('en')   as string,
        prenom:       formData.get('ln')   as string,
        mot_de_passe: formData.get('pass') as string,
    }
})};