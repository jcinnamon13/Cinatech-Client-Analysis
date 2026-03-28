import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { File, UploadCloud, FileText, Settings, Users } from 'lucide-react';
import { ClientCard } from '@/components/dashboard/client-card';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch clients and their documents
    const { data: clients } = await supabase
        .from('clients')
        .select(`
            *,
            documents (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Aggregate stats
    const totalClients = clients?.length || 0;

    let totalDocs = 0;
    let pendingDocs = 0;

    clients?.forEach(client => {
        totalDocs += client.documents?.length || 0;
        pendingDocs += client.documents?.filter((d: { status: string }) => ['uploading', 'analysing'].includes(d.status)).length || 0;
    });

    return (
        <div className="flex flex-col gap-6 animate-fade-in max-w-6xl mx-auto py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-2">Dashboard</h1>
                    <p className="text-[var(--text-secondary)] text-sm">
                        Overview of your client onboarding documents and AI analyses.
                    </p>
                </div>
                <Link href="/upload" className="btn-primary group">
                    <UploadCloud className="w-4 h-4 mr-2 group-hover:-translate-y-0.5 transition-transform" />
                    Upload New Document
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <div className="glass-card p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-[var(--accent-indigo)]">
                            <Users strokeWidth={1.5} />
                        </div>
                        <div>
                            <div className="text-sm text-[var(--text-secondary)] font-medium mb-1">Total Clients</div>
                            <div className="text-3xl font-bold text-[var(--text-primary)]">{totalClients}</div>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-[var(--accent-emerald)]">
                            <FileText strokeWidth={1.5} />
                        </div>
                        <div>
                            <div className="text-sm text-[var(--text-secondary)] font-medium mb-1">Documents Analysed</div>
                            <div className="text-3xl font-bold text-[var(--text-primary)]">{totalDocs - pendingDocs}</div>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-[var(--accent-amber)]">
                            <Settings strokeWidth={1.5} className={pendingDocs > 0 ? "animate-spin-slow" : ""} />
                        </div>
                        <div>
                            <div className="text-sm text-[var(--accent-amber)]/80 font-medium mb-1">Pending Analysis</div>
                            <div className="text-3xl font-bold text-[var(--accent-amber)]">{pendingDocs}</div>
                        </div>
                    </div>
                </div>
            </div>

            {totalClients === 0 ? (
                <div className="glass-card mt-8 flex flex-col items-center justify-center p-16 text-center shadow-lg border-dashed border-2 border-white/5">
                    <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6 text-[var(--accent-indigo)]">
                        <File className="w-10 h-10" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No clients yet</h3>
                    <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-8">
                        Get started by uploading your first client onboarding form for our AI consultant to analyse and generate actionable recommendations.
                    </p>
                    <Link href="/upload" className="btn-primary px-8 py-3 text-sm font-medium">
                        <UploadCloud className="w-4 h-4 inline-block mr-2" />
                        First Upload
                    </Link>
                </div>
            ) : (
                <div className="mt-8 space-y-6">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] px-1">Recent Clients</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {clients?.map(client => (
                            <ClientCard key={client.id} client={client} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
