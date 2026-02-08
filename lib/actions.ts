'use server'

import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        // We pass the credentials directly. signIn will throw a redirect on success.
        await signIn('credentials', {
            username: formData.get('username'),
            password: formData.get('password'),
            redirectTo: '/dashboard',
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        // IMPORTANT: Re-throw the redirect error so Next.js can handle it.
        throw error;
    }
}
