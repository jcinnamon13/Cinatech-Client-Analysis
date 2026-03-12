import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { File, ChevronLeft, Calendar } from 'lucide-react';
import { formatRelativeDate, getStatusColor, getStatusLabel } from '@/lib/utils';

export default async function ClientPage(props: { params: Promise<{ clientId: string }> }) {
    const params = await props.params;
    const clientId = params.clientId;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch client and their documents
    const { data: client, error } = await supabase
        .from('clients')
        .select(`
            *,
            documents (*)
        `)
        .eq('id', clientId)
        .eq('user_id', user.id)
        .single();

    if (error || !client) {
        return (
            <div className="flex flex-col items-center justify-center p-16 text-center">
                <h3 className="text-xl font-bold text-white mb-2">Client Not Found</h3>
                <p className="text-slate-400 mb-8">This client may have been deleted or doesn't belong to you.</p>
                <Link href="/dashboard" className="btn-primary px-6 py-2">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    // Sort documents by newest first
    const documents = client.documents?.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ) || [];

    return (
        <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto py-4 w-full">
            <Link href="/dashboard" className="text-sm font-medium text-slate-400 hover:text-white flex items-center transition-colors w-fit">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
            </Link>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{client.name}</h1>
                    <div className="flex items-center text-slate-400 text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Added {formatRelativeDate(client.created_at)}
                    </div>
                </div>
            </div>

            <div className="glass-card overflow-hidden mt-4">
                <div className="p-5 border-b border-[var(--border)] bg-white/[0.02]">
                    <h2 className="font-semibold text-white">All Documents ({documents.length})</h2>
                </div>

                {documents.length > 0 ? (
                    <div className="divide-y divide-[var(--border)]">
                        {documents.map((doc: any) => (
                            <Link 
                                href={`/documents/${doc.id}`} 
                                key={doc.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-white/[0.03] transition-colors block group"
                            >
                                <div className="flex items-start gap-4 mb-4 sm:mb-0">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                        doc.file_type === 'pdf' ? 'bg-red-500/10 text-red-400' : 
                                        doc.file_type === 'docx' ? 'bg-blue-500/10 text-blue-400' :
                                        doc.file_type === 'csv' ? 'bg-emerald-500/10 text-emerald-400' :
                                        doc.file_type === 'txt' ? 'bg-slate-500/10 text-slate-400' :
                                        'bg-purple-500/10 text-purple-400'
                                    }`}>
                                        <File className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                                            {doc.file_name}
                                        </h3>
                                        <p className="text-sm text-slate-400 mt-1">
                                            Uploaded {formatRelativeDate(doc.created_at)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 sm:ml-4">
                                    <span className={`text-xs px-3 py-1.5 rounded-full uppercase tracking-wider font-semibold border ${getStatusColor(doc.status)}`}>
                                        {getStatusLabel(doc.status)}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-slate-400">
                        No documents found for this client.
                    </div>
                )}
            </div>
        </div>
    );
}
