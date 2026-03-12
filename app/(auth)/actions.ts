'use server';

import { createClient, createServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type ActionState = { error?: string; redirect?: string };

export async function login(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('[login error]', error.message, error.status, error.code);
        return { error: error.message };
    }

    revalidatePath('/', 'layout');
    // Return a redirect signal instead of calling redirect() directly,
    // which breaks useActionState by returning HTML instead of JSON.
    return { redirect: '/dashboard' };
}

export async function register(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const agencyName = formData.get('agencyName') as string;

    // Use the admin client so we can set email_confirm: true,
    // bypassing the email verification step for this prototype.
    const adminClient = await createServiceClient();

    const { error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: fullName,
            agency_name: agencyName,
        },
    });

    if (error) {
        // If email already exists (possibly unconfirmed from a previous attempt),
        // find and confirm the existing user rather than blocking registration.
        if (error.message.toLowerCase().includes('already')) {
            const { data: list } = await adminClient.auth.admin.listUsers();
            const existing = list?.users?.find((u) => u.email === email);
            if (existing) {
                await adminClient.auth.admin.updateUserById(existing.id, {
                    password,
                    email_confirm: true,
                    user_metadata: { full_name: fullName, agency_name: agencyName },
                });
            } else {
                return { error: 'Account already exists. Please sign in instead.' };
            }
        } else {
            console.error('[register error]', error.message);
            return { error: error.message };
        }
    }

    // Now sign the user in so they get a session cookie.
    const supabase = await createClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
        console.error('[post-register login error]', loginError.message);
        return { error: loginError.message };
    }

    revalidatePath('/', 'layout');
    return { redirect: '/dashboard' };
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
}
