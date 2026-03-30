import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { FileText, Sparkles, CheckCircle2, AlertTriangle, MessageSquare, User, Clock, Target } from 'lucide-react';
import { cleanSummary } from '@/lib/utils';

interface AnalysisBlock {
    question: string;
    original_response: string;
    improved_response: string;
    recommendations: string[];
    flags: string[];
}

export default async function SharedReportPage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const resolvedParams = await params;
    const token = resolvedParams.token;

    // Use a public-read supabase client (anon key, no auth required)
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Find document by share token (no status filter — allow any shared doc)
    const { data: document, error } = await supabase
        .from('documents')
        .select(`
            *,
            clients (name),
            analyses (summary, structured_result, metadata, created_at)
        `)
        .eq('share_token', token)
        .maybeSingle();

    if (error || !document) {
        notFound();
    }

    // Check token expiry — null means never expires (existing documents)
    if (document.share_expires_at && new Date(document.share_expires_at) < new Date()) {
        return (
            <div className="min-h-screen bg-[#070B14] text-white flex items-center justify-center">
                <div className="max-w-md mx-auto px-4 text-center space-y-4">
                    <div className="p-3 bg-amber-500/10 rounded-full w-14 h-14 flex items-center justify-center mx-auto">
                        <Clock className="w-7 h-7 text-amber-400" />
                    </div>
                    <h1 className="text-xl font-semibold text-white">This link has expired</h1>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        This report link is no longer active. Please contact the person who shared it with you to request a new link.
                    </p>
                </div>
            </div>
        );
    }

    const clientName = document.clients?.name || 'Client';
    // Sort analyses by created_at desc and take the latest
    const sortedAnalyses = (document.analyses || []).sort(
        (a: { created_at: string }, b: { created_at: string }) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const analysis = sortedAnalyses[0];

    // Defensively parse structured_result
    let results: AnalysisBlock[] = [];
    let priorityPlan: any[] | null = null;

    if (analysis?.structured_result) {
        let raw = analysis.structured_result;
        if (typeof raw === 'string') {
            try { raw = JSON.parse(raw); } catch { raw = []; }
        }

        if (Array.isArray(raw)) {
            results = raw as AnalysisBlock[];
        } else if (raw && typeof raw === 'object') {
            results = (raw as any).pillars || [];
            priorityPlan = (raw as any).priority_action_plan || null;
        }
    }

    // Derive display fields from AI-extracted metadata, falling back to client name
    type Metadata = { company_name?: string | null; individual_name?: string | null; job_title?: string | null };
    const meta = (analysis?.metadata as Metadata) ?? {};
    const displayName = meta.company_name || clientName;
    const individualName = meta.individual_name || null;
    const jobTitle = meta.job_title || null;

    return (
        <div className="min-h-screen bg-[#070B14] text-white">
            {/* Gradient background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
                {/* Header */}
                <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl">
                            <FileText className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">CinaTech Analysis Report</span>
                            </div>
                            <h1 className="text-2xl font-semibold text-white">{displayName}</h1>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                {individualName && (
                                    <span className="text-zinc-300 text-sm font-medium">{individualName}</span>
                                )}
                                {jobTitle && (
                                    <>
                                        {individualName && <span className="text-zinc-600 text-sm">•</span>}
                                        <span className="text-zinc-400 text-sm">{jobTitle}</span>
                                    </>
                                )}
                                {(individualName || jobTitle) && <span className="text-zinc-600 text-sm">•</span>}
                                <p className="text-zinc-500 text-xs">{document.file_name}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Executive Summary */}
                {analysis?.summary && (
                    <div className="p-8 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur-sm rounded-2xl border border-indigo-500/20 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
                        <div className="flex items-center space-x-3 mb-4">
                            <Sparkles className="w-6 h-6 text-indigo-400" />
                            <h2 className="text-xl font-semibold text-white">Executive Summary</h2>
                        </div>
                        <div className="text-zinc-300 space-y-4">
                            {cleanSummary(analysis.summary).split('\n\n').map((p: string, i: number) => (
                                <p key={i} className="leading-relaxed">{p}</p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Detailed Q&A Blocks */}
                <div className="space-y-6">
                    <h3 className="text-lg font-medium text-white px-2">Detailed Analysis</h3>
                    {results.length === 0 && (
                        <div className="p-8 text-center text-zinc-500 bg-white/5 border border-white/10 rounded-xl">
                            <p className="text-sm">No detailed analysis blocks are available for this report.</p>
                        </div>
                    )}
                    {results.map((block, index) => (
                        <div key={index} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-white/10 bg-white/[0.02]">
                                <div className="flex items-start space-x-3">
                                    <MessageSquare className="w-5 h-5 text-zinc-400 mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="text-[15px] font-medium text-zinc-200">{block.question}</h4>
                                        <div className="mt-3 p-4 bg-black/20 rounded-lg border border-white/5">
                                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Client&apos;s Answer</span>
                                            <p className="text-zinc-400 text-sm leading-relaxed">{block.original_response}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <div className="flex items-center space-x-2 mb-3">
                                        <Sparkles className="w-4 h-4 text-indigo-400" />
                                        <span className="text-sm font-medium text-indigo-300">Strategic Translation</span>
                                    </div>
                                    <p className="text-white text-[15px] leading-relaxed pl-6 border-l-2 border-indigo-500/50">
                                        {block.improved_response}
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                    {block.recommendations?.length > 0 && (
                                        <div>
                                            <div className="flex items-center space-x-2 mb-3">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                <span className="text-sm font-medium text-emerald-300">Actionable Recommendations</span>
                                            </div>
                                            <ul className="space-y-2">
                                                {block.recommendations.map((rec, rIdx) => (
                                                    <li key={rIdx} className="flex items-start space-x-2 text-sm text-zinc-400">
                                                        <span className="text-emerald-500/50 mt-1 flex-shrink-0">•</span>
                                                        <span className="leading-relaxed">{rec}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {block.flags?.length > 0 && (
                                        <div>
                                            <div className="flex items-center space-x-2 mb-3">
                                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                                <span className="text-sm font-medium text-amber-300">Areas for Clarification</span>
                                            </div>
                                            <ul className="space-y-2">
                                                {block.flags.map((flag, fIdx) => (
                                                    <li key={fIdx} className="flex items-start space-x-2 text-sm text-zinc-400">
                                                        <span className="text-amber-500/50 mt-1 flex-shrink-0">•</span>
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
                            <CheckCircle2 className="w-6 h-6 text-emerald-400 mt-0.5" />
                            <div>
                                <h2 className="text-xl font-semibold text-white tracking-tight">Priority Action Plan</h2>
                                <p className="text-sm text-zinc-400 mt-1">
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
                                            <div className="flex-1 w-full text-zinc-300 text-[15px] leading-snug">
                                                {parts.length >= 3 ? (
                                                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-2 gap-y-2">
                                                        <span className="font-medium text-emerald-100">{parts[0]}</span>
                                                        <span className="text-zinc-600 hidden sm:inline mt-1">•</span>
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/10 rounded-md border border-indigo-500/20">
                                                            <Clock className="w-3 h-3 text-indigo-400/70" />
                                                            <span className="text-indigo-400/70 text-[10px] uppercase tracking-wider font-bold">Deadline</span>
                                                            <div className="w-px h-3 bg-indigo-500/20 mx-0.5"></div>
                                                            <span className="text-indigo-300/90 text-xs font-medium">{parts[2]}</span>
                                                        </div>
                                                        {parts[3] && (
                                                            <>
                                                                <span className="text-zinc-600 hidden sm:inline mt-1">•</span>
                                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-md border border-white/10">
                                                                    <Target className="w-3 h-3 text-zinc-500" />
                                                                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold">Pillar</span>
                                                                    <div className="w-px h-3 bg-white/10 mx-0.5"></div>
                                                                    <span className="text-zinc-400 text-xs font-medium">{parts[3]}</span>
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
                                                    <span className="font-semibold text-emerald-100/90 text-[16px]">{obj.action}</span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/10 rounded-md border border-indigo-500/20">
                                                        <Clock className="w-3 h-3 text-indigo-400/70" />
                                                        <span className="text-indigo-400/70 text-[10px] uppercase tracking-wider font-bold">Deadline</span>
                                                        <div className="w-px h-3 bg-indigo-500/20 mx-0.5"></div>
                                                        <span className="text-indigo-300/90 text-xs font-medium">{obj.deadline}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-md border border-white/10">
                                                        <Target className="w-3 h-3 text-zinc-500" />
                                                        <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold">Pillar</span>
                                                        <div className="w-px h-3 bg-white/10 mx-0.5"></div>
                                                        <span className="text-zinc-400 text-xs font-medium">{obj.pillar}</span>
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
                                                        <div className="flex items-start space-x-2 text-rose-300/90 text-[14px] leading-relaxed">
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

                {/* Footer */}
                <div className="text-center py-6 border-t border-white/10">
                    <p className="text-zinc-500 text-sm">
                        Generated by{' '}
                        <span className="text-indigo-400 font-medium">CinaTech Client Analysis Portal</span>
                        {' '}— Powered by Claude AI
                    </p>
                </div>
            </div>
        </div>
    );
}
