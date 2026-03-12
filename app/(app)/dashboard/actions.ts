'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteDocument(documentId: string, filePath: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('Unauthorized');
        }

        // 1. Delete from Storage
        if (filePath) {
            const { error: storageErr } = await supabase.storage
                .from('documents')
                .remove([filePath]);

            if (storageErr) {
                console.error("Failed to delete from storage:", storageErr);
                // Continue with DB deletion even if storage fails to avoid orphaned DB records
            }
        }

        // 2. Delete from Database (analyses will be cascade deleted)
        const { error: dbErr } = await supabase
            .from('documents')
            .delete()
            .eq('id', documentId)
            .eq('user_id', user.id); // Security check

        if (dbErr) throw new Error(`Database deletion failed: ${dbErr.message}`);

        revalidatePath('/dashboard');
        revalidatePath('/clients');

        return { success: true };
    } catch (error) {
        console.error('Delete document error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to delete document' };
    }
}

export async function deleteClient(clientId: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('Unauthorized');
        }

        // 1. Get all documents for this client to delete them from storage
        const { data: documents } = await supabase
            .from('documents')
            .select('file_path')
            .eq('client_id', clientId)
            .eq('user_id', user.id);

        if (documents && documents.length > 0) {
            const filePaths = documents.map(d => d.file_path).filter(Boolean);
            if (filePaths.length > 0) {
                await supabase.storage
                    .from('documents')
                    .remove(filePaths);
            }
        }

        // 2. Delete the client from DB
        const { error: dbErr } = await supabase
            .from('clients')
            .delete()
            .eq('id', clientId)
            .eq('user_id', user.id);

        if (dbErr) throw new Error(`Database deletion failed: ${dbErr.message}`);

        revalidatePath('/dashboard');
        revalidatePath('/clients');

        return { success: true };
    } catch (error) {
        console.error('Delete client error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to delete client' };
    }
}

export async function toggleClientShareStatus(clientId: string, isShared: boolean) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('Unauthorized');
        }

        const { error } = await supabase
            .from('clients')
            .update({ is_shared: isShared })
            .eq('id', clientId)
            .eq('user_id', user.id);

        if (error) {
            console.error('Failed to update client share status in supbase:', error);
            throw error;
        }

        revalidatePath('/clients');
        return { success: true };
    } catch (error) {
        console.error('share status error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update status' };
    }
}
