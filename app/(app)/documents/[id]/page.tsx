import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { getStatusColor, getStatusLabel, formatDate, cleanSummary } from '@/lib/utils';
import {
    FileText,
    ArrowLeft,
    AlertTriangle,
    CheckCircle2,
    Sparkles,
    MessageSquare,
    Loader2,
    User,
    Clock,
    Target
} from 'lucide-react';
import Link from 'next/link';
import { DocumentActions } from '@/components/document-actions';
import { AutoRefresh } from '@/components/auto-refresh';
import type { ActionItem, StructuredResult } from '@/types';

interface AnalysisBlock {
    question: string;
    original_response: string;
    improved_response: string;
    recommendations: string[];
    flags: string[];
}

export default async function DocumentPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const resolvedParams = await params;
    const documentId = resolvedParams.id;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch document and all its analyses (ordered by version desc — latest first)
    const { data: document, error } = await supabase
        .from('documents')
        .select(`
            *,
            clients (name),
            analyses (
                id,
                summary,
                structured_result,
                metadata,
                created_at,
                version
            )
        `)
        .eq('id', documentId)
        .eq('user_id', user.id)
        .order('version', { ascending: false, referencedTable: 'analyses' })
        .single();

    if (error || !document) {
        notFound();
    }

    const clientName = document.clients?.name || 'Unknown Client';
    const allAnalyses = document.analyses || [];
    const analysis = allAnalyses[0];

    // Parse the structured JSON result (handles both legacy array and new object format)
    let results: AnalysisBlock[] = [];
    let priorityPlan: (ActionItem | string)[] | null = null;

    if (analysis?.structured_result) {
        if (Array.isArray(analysis.structured_result)) {
            results = analysis.structured_result as unknown as AnalysisBlock[];
        } else if (typeof analysis.structured_result === 'object') {
            const parsedObj = analysis.structured_result as unknown as StructuredResult;
            results = parsedObj.pillars || [];
            priorityPlan = parsedObj.priority_action_plan || null;
        }
    }

    // Derive display fields from AI-extracted metadata, falling back to client name
    type Metadata = { company_name?: string | null; individual_name?: string | null; job_title?: string | null };
    const meta = (analysis?.metadata as Metadata) ?? {};
    const displayName = meta.company_name || clientName;
    const individualName = meta.individual_name || null;
    const jobTitle = meta.job_title || null;

    const isPending = document.status === 'uploading' || document.status === 'analysing';
    const isError = document.status === 'error';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Silent auto-refresher when analysis is pending */}
            <AutoRefresh status={document.status} />
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-[var(--bg-surface)] backdrop-blur-md rounded-2xl border border-[var(--border-subtle)] shadow-xl">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
                    </Link>
                    <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl">
                        <FileText className="w-6 h-6 text-[var(--accent-indigo)]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">{displayName}</h1>
                        <div className="flex flex-wrap items-center gap-3 text-sm mt-1">
                            {individualName && (
                                <span className="text-[var(--text-primary)] font-medium">{individualName}</span>
                            )}
                            {jobTitle && (
                                <>
                                    {individualName && <span className="text-[var(--text-muted)]">•</span>}
                                    <span className="text-[var(--text-secondary)]">{jobTitle}</span>
                                </>
                            )}
                            {(individualName || jobTitle) && <span className="text-[var(--text-muted)]">•</span>}
                            <span className="text-[var(--text-muted)] text-xs">{document.file_name}</span>
                            <span className="text-[var(--text-muted)]">•</span>
                            <span className="text-[var(--text-secondary)]">Uploaded {formatDate(document.created_at)}</span>
                            <span className="text-[var(--text-muted)]">•</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(document.status)}`}>
                                {getStatusLabel(document.status)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="pl-14 sm:pl-0">
                    <DocumentActions
                        documentId={documentId}
                        documentName={document.file_name}
                        clientName={clientName}
                        shareToken={document.share_token ?? null}
                        analysisData={results.length > 0 ? results : null}
                        summary={analysis?.summary ?? null}
                        isReady={document.status === 'ready'}
                    />
                </div>
            </div>

            {/* Print-only header — hidden on screen, visible when printing */}
            <div className="print-header hidden">
                <p className="print-client-name">CinaTech Client Analysis Portal</p>
                <h1 style={{ fontSize: '18pt', margin: '0 0 4pt', color: '#111' }}>{document.file_name}</h1>
                <p style={{ fontSize: '10pt', color: '#6b7280', margin: 0 }}>{clientName} • {formatDate(document.created_at)}</p>
            </div>

            {/* Content Section */}
            {isPending && (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full" />
                        <Loader2 className="w-12 h-12 text-[var(--accent-indigo)] animate-spin relative" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-medium text-[var(--text-primary)]">Analysis in Progress</h3>
                        <p className="text-[var(--text-secondary)] max-w-md mx-auto">
                            Claude is reviewing the document, extracting insights, and formulating strategic recommendations. This usually takes 15-30 seconds.
                        </p>
                    </div>
                </div>
            )}

            {isError && (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                    <div className="p-4 bg-red-500/10 rounded-full">
                        <AlertTriangle className="w-10 h-10 text-[var(--accent-red)]" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-medium text-[var(--text-primary)]">Analysis Failed</h3>
                        <p className="text-[var(--text-secondary)] max-w-md mx-auto">
                            There was an error processing this document. Ensure it is a valid PDF or DOCX file containing text.
                        </p>
                    </div>
                </div>
            )}

            {document.status === 'ready' && analysis && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">

                    {/* Executive Summary */}
                    {analysis.summary && (
                        <div className="p-8 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur-sm rounded-2xl border border-indigo-500/20 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
                            <div className="flex items-center space-x-3 mb-4">
                                <Sparkles className="w-6 h-6 text-[var(--accent-indigo)]" />
                                <h2 className="text-xl font-semibold text-[var(--text-primary)]">Executive Summary</h2>
                            </div>
                            <div className="prose prose-invert prose-indigo max-w-none text-[var(--text-primary)]">
                                {cleanSummary(analysis.summary).split('\n\n').map((paragraph: string, i: number) => (
                                    <p key={i} className="mb-4 last:mb-0 leading-relaxed">{paragraph}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Q&A Analysis Blocks */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-[var(--text-primary)] px-2">Detailed Analysis</h3>
                        {results.map((block, index) => (
                            <div key={index} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden hover:border-white/20 transition-colors">
                                <div className="p-6 border-b border-[var(--border-subtle)] bg-white/[0.02]">
                                    <div className="flex items-start space-x-3">
                                        <MessageSquare className="w-5 h-5 text-[var(--text-secondary)] mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-[15px] font-medium text-[var(--text-primary)]">{block.question}</h4>
                                            <div className="mt-3 p-4 bg-[var(--bg-overlay)] rounded-lg border border-white/5">
                                                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Client Context & Synthesis</span>
                                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{block.original_response}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Improved Response */}
                                    <div>
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Sparkles className="w-4 h-4 text-[var(--accent-indigo)]" />
                                            <span className="text-sm font-medium text-[var(--accent-indigo)]">Agency Objective</span>
                                        </div>
                                        <p className="text-[var(--text-primary)] text-[15px] leading-relaxed pl-6 border-l-2 border-indigo-500/50">
                                            {block.improved_response}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                        {/* Recommendations */}
                                        {block.recommendations && block.recommendations.length > 0 && (
                                            <div>
                                                <div className="flex items-center space-x-2 mb-3">
                                                    <CheckCircle2 className="w-4 h-4 text-[var(--accent-emerald)]" />
                                                    <span className="text-sm font-medium text-[var(--accent-emerald)]">Actionable Recommendations</span>
                                                </div>
                                                <ul className="space-y-2 list-none pl-0">
                                                    {block.recommendations.map((rec, rIdx) => (
                                                        <li key={rIdx} className="flex items-start space-x-2 text-sm text-[var(--text-secondary)]">
                                                            <span className="text-[var(--accent-emerald)]/50 mt-1 flex-shrink-0">•</span>
                                                            <span className="leading-relaxed">{rec}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Flags */}
                                        {block.flags && block.flags.length > 0 && (
                                            <div>
                                                <div className="flex items-center space-x-2 mb-3">
                                                    <AlertTriangle className="w-4 h-4 text-[var(--accent-amber)]" />
                                                    <span className="text-sm font-medium text-[var(--accent-amber)]">Areas for Clarification</span>
                                                </div>
                                                <ul className="space-y-2 list-none pl-0">
                                                    {block.flags.map((flag, fIdx) => (
                                                        <li key={fIdx} className="flex items-start space-x-2 text-sm text-[var(--text-secondary)]">
                                                            <span className="text-[var(--accent-amber)]/50 mt-1 flex-shrink-0">•</span>
                                                            <span className="leading-relaxed">{flag}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Priority Action Plan */}
                    {priorityPlan && priorityPlan.length > 0 && (
                        <div className="p-8 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 backdrop-blur-sm rounded-2xl border border-emerald-500/20 shadow-xl relative overflow-hidden mt-8">
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full" />
                            <div className="flex items-start space-x-3 mb-6 relative">
                                <CheckCircle2 className="w-6 h-6 text-[var(--accent-emerald)] mt-0.5" />
                                <div>
                                    <h2 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">Priority Action Plan</h2>
                                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                                        The following actions represent the highest-leverage starting points and should form the agenda for the first working session.
                                    </p>
                                </div>
                            </div>
                            <ul className="space-y-3 relative z-10 pl-0">
                                {priorityPlan.map((action, idx) => {
                                    if (typeof action === 'string') {
                                        const cleanText = action.replace(/^\d+\.\s*/, '');
                                        const parts = cleanText.split(/—|-/).map(p => p.trim());

                                        return (
                                            <li key={idx} className="p-4 bg-black/20 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center gap-4">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1 w-full text-[var(--text-primary)] text-[15px] leading-snug">
                                                    {parts.length >= 3 ? (
                                                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-2 gap-y-2">
                                                            <span className="font-medium text-[var(--text-primary)]">{parts[0]}</span>
                                                            <span className="text-[var(--text-muted)] hidden sm:inline mt-1">•</span>
                                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/10 rounded-md border border-indigo-500/20">
                                                                <Clock className="w-3 h-3 text-[var(--accent-indigo)]/70" />
                                                                <span className="text-[var(--accent-indigo)]/70 text-[10px] uppercase tracking-wider font-bold">Deadline</span>
                                                                <div className="w-px h-3 bg-indigo-500/20 mx-0.5"></div>
                                                                <span className="text-[var(--accent-indigo)]/90 text-xs font-medium">{parts[2]}</span>
                                                            </div>
                                                            {parts[3] && (
                                                                <>
                                                                    <span className="text-[var(--text-muted)] hidden sm:inline mt-1">•</span>
                                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[var(--bg-surface)] rounded-md border border-[var(--border-subtle)]">
                                                                        <Target className="w-3 h-3 text-[var(--text-muted)]" />
                                                                        <span className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider font-bold">Pillar</span>
                                                                        <div className="w-px h-3 bg-[var(--border-subtle)] mx-0.5"></div>
                                                                        <span className="text-[var(--text-secondary)] text-xs font-medium">{parts[3]}</span>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span>{cleanText}</span>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    }

                                    const obj = action as any;
                                    return (
                                        <li key={idx} className="p-5 bg-black/20 rounded-xl border border-white/5 flex flex-col gap-3">
                                            <div className="flex items-start gap-4">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mt-0.5">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1 space-y-2 w-full">
                                                    <div className="flex flex-col md:flex-row md:items-center md:gap-x-3 gap-y-1 w-full">
                                                        <span className="font-semibold text-[var(--text-primary)] text-[16px]">{obj.action}</span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/10 rounded-md border border-indigo-500/20">
                                                            <Clock className="w-3 h-3 text-[var(--accent-indigo)]/70" />
                                                            <span className="text-[var(--accent-indigo)]/70 text-[10px] uppercase tracking-wider font-bold">Deadline</span>
                                                            <div className="w-px h-3 bg-indigo-500/20 mx-0.5"></div>
                                                            <span className="text-[var(--accent-indigo)]/90 text-xs font-medium">{obj.deadline}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[var(--bg-surface)] rounded-md border border-[var(--border-subtle)]">
                                                            <Target className="w-3 h-3 text-[var(--text-muted)]" />
                                                            <span className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider font-bold">Pillar</span>
                                                            <div className="w-px h-3 bg-[var(--border-subtle)] mx-0.5"></div>
                                                            <span className="text-[var(--text-secondary)] text-xs font-medium">{obj.pillar}</span>
                                                        </div>
                                                        {obj.time_horizon && (
                                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 rounded-md border border-amber-500/20">
                                                                <Clock className="w-3 h-3 text-amber-400/70" />
                                                                <span className="text-amber-400/70 text-[10px] uppercase tracking-wider font-bold">Horizon</span>
                                                                <div className="w-px h-3 bg-amber-500/20 mx-0.5"></div>
                                                                <span className="text-amber-300/90 text-xs font-medium">{obj.time_horizon}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {obj.consequence && (
                                                        <div className="pt-2 mt-2 border-t border-white/5">
                                                            <div className="flex items-start space-x-2 text-[var(--accent-rose)]/90 text-[14px] leading-relaxed">
                                                                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                                <span className="whitespace-pre-wrap">{obj.consequence}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}

                    {/* Version History — Phase 10 */}
                    {allAnalyses.length > 0 && (
                        <div className="p-6 bg-white/[0.02] border border-[var(--border-subtle)] rounded-xl">
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-4 h-4 rounded-full border-2 border-indigo-400 flex-shrink-0" />
                                <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Analysis Version History</h3>
                            </div>
                            <div className="space-y-2 pl-2">
                                {allAnalyses.map((v: { id: string; version: number; created_at: string }, i: number) => (
                                    <div key={v.id} className={`flex items-center justify-between py-2 px-3 rounded-lg text-sm transition-colors ${i === 0 ? 'bg-indigo-500/10 border border-indigo-500/20' : 'hover:bg-white/5'}`}>
                                        <div className="flex items-center space-x-2">
                                            <span className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-indigo-400' : 'bg-zinc-600'}`} />
                                            <span className={i === 0 ? 'text-[var(--accent-indigo)] font-medium' : 'text-[var(--text-secondary)]'}>
                                                Version {v.version}
                                            </span>
                                            {i === 0 && <span className="text-xs bg-indigo-500/20 text-[var(--accent-indigo)] px-1.5 py-0.5 rounded-full">Current</span>}
                                        </div>
                                        <span className="text-[var(--text-muted)] text-xs">{formatDate(v.created_at)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
