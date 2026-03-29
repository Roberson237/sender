'use server';

import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { notFound } from "next/navigation";

export async function authenticateUser(formData: FormData) {
  try {
    const email = formData.get('emc') as string;
    const password = formData.get('passc') as string;

   
    if (!email || !password) {
      throw new Error('Email et mot de passe requis');
    }

    
    const user = await prisma.utilisateur.findUnique({
      where: { email },
    });

   
    if (!user) {
      
      throw new Error('Email incorrect');
    }

   
    const isPasswordValid = await bcrypt.compare(password, user.mot_de_passe);
    if (!isPasswordValid) {
     
      throw new Error('mot de passe incorrect');
    }

    

    redirect('/page/uploadspace');
  } catch (error) {
    if(isRedirectError(error)) throw error
    console.error('Erreur lors de l\'authentification:', error);
   
   
    
    
  }
}
 