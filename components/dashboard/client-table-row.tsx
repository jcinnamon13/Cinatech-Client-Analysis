'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ChevronRight, Trash2, Users, CheckCircle2, Circle } from 'lucide-react';
import { deleteClient, toggleClientShareStatus } from '@/app/(app)/dashboard/actions';
import { formatRelativeDate } from '@/lib/utils';

export function ClientTableRow({ client }: { client: any }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete the client "${client.name}" and ALL of their documents? This action cannot be undone.`)) {
            setIsDeleting(true);
            await deleteClient(client.id);
        }
    };

    const handleToggleShare = () => {
        startTransition(async () => {
            await toggleClientShareStatus(client.id, !client.is_shared);
        });
    };

    if (isDeleting) {
        return (
            <div className="bg-white/[0.02] border-b border-[var(--border)] p-4 flex items-center justify-center opacity-50">
                <span className="text-sm text-slate-400 animate-pulse">Deleting {client.name}...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-[var(--border)] hover:bg-white/[0.02] transition-colors gap-4">
            <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-inner shadow-white/20 shrink-0">
                    {client.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                    <h3 className="font-semibold text-white text-lg truncate" title={client.name}>
                        {client.name}
                    </h3>
                    <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Users className="w-3.5 h-3.5" />
                        Added {formatRelativeDate(client.created_at)}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-6 sm:ml-auto">
                <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-white">
                        {client.documents?.length || 0}
                    </div>
                    <div className="text-xs text-slate-400">
                        {client.documents?.length === 1 ? 'Document' : 'Documents'}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleToggleShare}
                        disabled={isPending}
                        className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${client.is_shared
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                            } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={client.is_shared ? "Mark as Not Shared" : "Mark as Shared"}
                    >
                        {client.is_shared ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Shared</span>
                            </>
                        ) : (
                            <>
                                <Circle className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />
                                <span className="hidden sm:inline">Feedback not shared</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                        title="Delete Client"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                        href={`/clients/${client.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium transition-colors border border-blue-500/20"
                    >
                        View Profile
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
