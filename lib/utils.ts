import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(dateString));
}

export function formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
}

export function getFileType(fileName: string): 'pdf' | 'docx' | 'image' | 'txt' | 'csv' {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'docx' || ext === 'doc') return 'docx';
    if (ext === 'txt') return 'txt';
    if (ext === 'csv') return 'csv';
    return 'image';
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + '…';
}

export function getStatusColor(status: string): string {
    switch (status) {
        case 'ready':
            return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
        case 'analysing':
            return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
        case 'uploading':
            return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
        case 'error':
            return 'text-red-400 bg-red-400/10 border-red-400/20';
        default:
            return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
}

export function getStatusLabel(status: string): string {
    switch (status) {
        case 'ready':
            return 'Ready';
        case 'analysing':
            return 'Analysing…';
        case 'uploading':
            return 'Uploading…';
        case 'error':
            return 'Error';
        default:
            return status;
    }
}

/**
 * Strips leading markdown headings (# Heading, ## Heading, etc.) and
 * any "Executive Summary:" style title lines from Claude-generated summaries.
 */
export function cleanSummary(raw: string): string {
    return raw
        .replace(/^#{1,6}\s+.*\n?/gm, '')
        .replace(/^Executive Summary[:\s]*.*\n?/im, '')
        .replace(/\n{3,}/g, '\n\n')  // collapse 3+ newlines to max 2
        .trim();
}
