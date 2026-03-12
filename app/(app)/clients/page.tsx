import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UploadCloud, Users, CheckCircle2, Circle } from 'lucide-react';
import { ClientTableRow } from '@/components/dashboard/client-table-row';

export default async function ClientsDatabasePage(props: {
    searchParams: Promise<{ tab?: string }>
}) {
    const searchParams = await props.searchParams;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const currentTab = searchParams.tab === 'shared' ? 'shared' : 'pending';

    // Fetch clients and their documents
    const { data: clients } = await supabase
        .from('clients')
        .select(`
            *,
            documents (id, file_type, file_name, status)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    const filteredClients = clients?.filter(c =>
        currentTab === 'shared' ? c.is_shared === true : c.is_shared !== true
    ) || [];

    return (
        <div className="flex flex-col gap-6 animate-fade-in max-w-6xl mx-auto py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Clients Database</h1>
                    <p className="text-slate-400 text-sm">
                        Manage your agency's clients and track sharing status.
                    </p>
                </div>
                <Link href="/upload" className="btn-primary group">
                    <UploadCloud className="w-4 h-4 mr-2 group-hover:-translate-y-0.5 transition-transform" />
                    Upload Form
                </Link>
            </div>

            <div className="flex flex-col gap-6">
                {/* Tabs */}
                <div className="flex items-center gap-2 border-b border-[var(--border)] pb-0">
                    <Link
                        href="/clients"
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${currentTab === 'pending'
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-slate-400 hover:text-slate-300'
                            }`}
                    >
                        <Circle className="w-4 h-4" />
                        Feedback not shared
                        <span className="ml-1.5 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs">
                            {clients?.filter(c => c.is_shared !== true).length || 0}
                        </span>
                    </Link>
                    <Link
                        href="/clients?tab=shared"
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${currentTab === 'shared'
                            ? 'border-emerald-500 text-emerald-400'
                            : 'border-transparent text-slate-400 hover:text-slate-300'
                            }`}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Shared
                        <span className="ml-1.5 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs">
                            {clients?.filter(c => c.is_shared === true).length || 0}
                        </span>
                    </Link>
                </div>

                {/* DB List */}
                <div className="glass-card overflow-hidden flex flex-col min-h-[500px]">
                    <div className="flex-1 overflow-y-auto">
                        {filteredClients && filteredClients.length > 0 ? (
                            <div className="flex flex-col">
                                {filteredClients.map(client => (
                                    <ClientTableRow key={client.id} client={client} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-16 text-center h-full">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${currentTab === 'shared' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                    {currentTab === 'shared' ? <CheckCircle2 className="w-10 h-10" strokeWidth={1.5} /> : <Users className="w-10 h-10" strokeWidth={1.5} />}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {currentTab === 'shared' ? 'No shared clients yet' : 'All feedback shared'}
                                </h3>
                                <p className="text-slate-400 max-w-md mx-auto mb-8">
                                    {currentTab === 'shared'
                                        ? "When you mark a client's analysis as shared, it will appear here."
                                        : "You don't have any clients waiting for feedback. Upload a new onboarding document to get started."}
                                </p>
                                {currentTab === 'pending' && (
                                    <Link href="/upload" className="btn-primary px-8 py-3 text-sm font-medium">
                                        <UploadCloud className="w-4 h-4 inline-block mr-2" />
                                        Add Client
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
