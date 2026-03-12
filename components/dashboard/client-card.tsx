'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, File, MoreVertical, Trash2 } from 'lucide-react';
import { formatRelativeDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { deleteClient, deleteDocument } from '@/app/(app)/dashboard/actions';

interface Document {
    id: string;
    file_type: string;
    file_name: string;
    status: string;
    file_path: string;
}

interface Client {
    id: string;
    name: string;
    created_at: string;
    documents: Document[];
}

export function ClientCard({ client }: { client: Client }) {
    const [isDeletingClient, setIsDeletingClient] = useState(false);
    const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
    const [showMenu, setShowMenu] = useState(false);

    const handleDeleteClient = async () => {
        if (confirm(`Are you sure you want to delete ${client.name} and ALL their documents? This action cannot be undone.`)) {
            setIsDeletingClient(true);
            await deleteClient(client.id);
            // Revalidation in the action will remove it from the UI immediately
            // No need to reset here as the component will unmount
        } else {
            setShowMenu(false);
        }
    };

    const handleDeleteDocument = async (docId: string, filePath: string) => {
        if (confirm('Are you sure you want to delete this document?')) {
            setDeletingDocId(docId);
            await deleteDocument(docId, filePath);
            setDeletingDocId(null);
        }
    };

    if (isDeletingClient) {
        return (
            <div className="glass-card flex items-center justify-center p-10 h-full opacity-50">
                <div className="animate-pulse text-sm text-slate-400">Deleting {client.name}...</div>
            </div>
        );
    }

    return (
        <div className="glass-card overflow-visible hover:border-slate-700/50 transition-colors flex flex-col h-full relative">
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3 overflow-hidden pr-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-inner shadow-white/20 shrink-0">
                        {client.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-white text-base truncate" title={client.name}>{client.name}</h3>
                        <p className="text-xs text-slate-400">Added {formatRelativeDate(client.created_at)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/clients/${client.id}`} className="text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 px-3 py-1.5 rounded-full transition-colors flex items-center shrink-0">
                        View All
                    </Link>
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-white/5 transition-colors focus:outline-none"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>
                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                                <div className="absolute right-0 mt-1 w-36 py-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20">
                                    <button
                                        onClick={handleDeleteClient}
                                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete Client
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-2 flex-grow">
                {client.documents && client.documents.length > 0 ? (
                    <ul className="space-y-1">
                        {client.documents.slice(0, 3).map((doc) => (
                            <li key={doc.id}>
                                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.03] transition-colors group">
                                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                                        <File className={`w-5 h-5 shrink-0 ${doc.file_type === 'pdf' ? 'text-red-400' : doc.file_type === 'docx' ? 'text-blue-400' : 'text-emerald-400'}`} />
                                        <span className="text-sm text-slate-300 truncate font-medium group-hover:text-white transition-colors" title={doc.file_name}>
                                            {doc.file_name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 ml-4">
                                        <span className={`text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold border ${getStatusColor(doc.status)}`}>
                                            {getStatusLabel(doc.status)}
                                        </span>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleDeleteDocument(doc.id, doc.file_path)}
                                                disabled={deletingDocId === doc.id}
                                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors disabled:opacity-50"
                                                title="Delete Document"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                            <Link href={`/documents/${doc.id}`} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition-colors" title="View Document">
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-6 text-center text-sm text-slate-500 h-full flex items-center justify-center">
                        No documents yet.
                    </div>
                )}
            </div>

            {client.documents && client.documents.length > 3 && (
                <div className="px-5 py-3 border-t border-[var(--border)] bg-white/[0.01]">
                    <Link href={`/clients/${client.id}`} className="text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center">
                        + {client.documents.length - 3} more {client.documents.length - 3 === 1 ? 'document' : 'documents'}
                    </Link>
                </div>
            )}
        </div>
    );
}
