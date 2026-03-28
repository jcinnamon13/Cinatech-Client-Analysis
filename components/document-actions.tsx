'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, Share2, Check, Copy, Mail, X, Loader2 } from 'lucide-react';

interface AnalysisBlock {
    question: string;
    original_response: string;
    improved_response: string;
    recommendations: string[];
    flags: string[];
}

interface DocumentActionsProps {
    documentId: string;
    documentName: string;
    clientName: string;
    shareToken: string | null;
    analysisData: AnalysisBlock[] | null;
    summary: string | null;
    isReady: boolean;
}

export function DocumentActions({
    documentId,
    documentName,
    clientName: _clientName,
    shareToken,
    analysisData: _analysisData,
    summary: _summary,
    isReady,
}: DocumentActionsProps) {
    const [showShareModal, setShowShareModal] = useState(false);
    const [copied, setCopied] = useState<'link' | 'rich' | null>(null);
    const [emailInput, setEmailInput] = useState('');
    const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    // --- PDF Export ---
    const handlePrintExport = () => {
        const a = document.createElement('a');
        a.href = `/api/documents/${documentId}/export?format=pdf`;
        a.download = '';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // --- Docs Export ---
    const handleDocsExport = () => {
        const a = document.createElement('a');
        a.href = `/api/documents/${documentId}/export?format=docx`;
        a.download = '';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // --- Copy Share Link ---
    const handleCopyLink = async () => {
        const shareUrl = `${window.location.origin}/shared/${shareToken || documentId}`;
        await navigator.clipboard.writeText(shareUrl);
        setCopied('link');
        setTimeout(() => setCopied(null), 3000);
    };

    // --- Send Share Email ---
    const handleSendEmail = async () => {
        if (!emailInput || !emailInput.includes('@')) return;
        setEmailStatus('sending');
        try {
            const res = await fetch('/api/share/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentId, email: emailInput }),
            });
            if (!res.ok) throw new Error('Failed to send');
            setEmailStatus('sent');
        } catch {
            setEmailStatus('error');
        }
    };

    return (
        <>
            <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                    onClick={() => setShowShareModal(true)}
                    disabled={!isReady}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg transition-colors border border-[var(--border-subtle)] disabled:opacity-50 disabled:cursor-not-allowed no-print"
                >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                </button>
                <div className="flex-1 sm:flex-none flex rounded-lg overflow-hidden border border-indigo-500/50 shadow-lg shadow-indigo-500/25 no-print">
                    <button
                        onClick={handlePrintExport}
                        disabled={!isReady}
                        title="Export as PDF"
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-[var(--accent-indigo)] hover:bg-[var(--accent-indigo-hover)] text-[var(--text-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="w-4 h-4" />
                        <span>PDF</span>
                    </button>
                    <div className="w-px bg-indigo-400/30" />
                    <button
                        onClick={handleDocsExport}
                        disabled={!isReady}
                        title="Download as Word document"
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-[var(--accent-indigo)] hover:bg-[var(--accent-indigo-hover)] text-[var(--text-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="w-4 h-4" /><span className="text-sm">Docs</span>
                    </button>
                </div>
            </div>

            {/* Share Modal — rendered via portal to escape stacking context */}
            {showShareModal && mounted && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setShowShareModal(false)}
                    />
                    <div className="relative w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Share Report</h3>
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="p-1.5 hover:bg-[var(--bg-surface)] rounded-lg transition-colors text-[var(--text-secondary)]"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Share Link */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Share Link</label>
                            <div className="flex items-center space-x-2">
                                <div className="flex-1 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] truncate font-mono">
                                    {`${window.location.origin}/shared/${shareToken || documentId}`}
                                </div>
                                <button
                                    onClick={handleCopyLink}
                                    className="flex-shrink-0 px-3 py-2 bg-[var(--border-subtle)] hover:bg-white/15 rounded-lg text-sm text-[var(--text-primary)] transition-colors border border-[var(--border-subtle)] flex items-center space-x-1.5"
                                >
                                    {copied === 'link' ? <Check className="w-4 h-4 text-[var(--accent-emerald)]" /> : <Copy className="w-4 h-4" />}
                                    <span>{copied === 'link' ? 'Copied!' : 'Copy'}</span>
                                </button>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[var(--border-subtle)]" />
                            </div>
                            <div className="relative flex justify-center text-xs text-[var(--text-muted)]">
                                <span className="bg-[var(--bg-card)] px-2">or send via email</span>
                            </div>
                        </div>

                        {/* Email Share */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Email</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="email"
                                    value={emailInput}
                                    onChange={e => setEmailInput(e.target.value)}
                                    placeholder="colleague@example.com"
                                    className="flex-1 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-indigo)]/70 focus:ring-1 focus:ring-[var(--accent-indigo)]/30 transition"
                                />
                                <button
                                    onClick={handleSendEmail}
                                    disabled={emailStatus === 'sending' || emailStatus === 'sent'}
                                    className="flex-shrink-0 px-3 py-2 bg-[var(--accent-indigo)] hover:bg-[var(--accent-indigo-hover)] rounded-lg text-sm text-[var(--text-primary)] transition-colors disabled:opacity-60 flex items-center space-x-1.5"
                                >
                                    {emailStatus === 'sending' && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {emailStatus === 'sent' && <Check className="w-4 h-4 text-[var(--accent-emerald)]" />}
                                    {(emailStatus === 'idle' || emailStatus === 'error') && <Mail className="w-4 h-4" />}
                                    <span>
                                        {emailStatus === 'sending' ? 'Sending...' : emailStatus === 'sent' ? 'Sent!' : 'Send'}
                                    </span>
                                </button>
                            </div>
                            {emailStatus === 'error' && (
                                <p className="text-xs text-[var(--accent-red)]">Failed to send email. Please try again.</p>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
