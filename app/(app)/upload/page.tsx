'use client';

import { useState, useRef } from 'react';
import { UploadCloud, File, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { cn, formatFileSize, getFileType } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface UploadFile {
    file: File;
    id: string;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
}

export default function DocumentUpload() {
    const [clientName, setClientName] = useState('');
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [isDragActive, setIsDragActive] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            addFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            addFiles(Array.from(e.target.files));
        }
    };

    const addFiles = (newFiles: File[]) => {
        const validTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/webp',
            'text/plain',
            'text/csv',
            'application/csv',
            // Some OS/browser combos emit an empty MIME type for .txt files
            '',
        ];

        const mappedFiles: UploadFile[] = newFiles.map(f => ({
            file: f,
            id: Math.random().toString(36).substring(7),
            progress: 0,
            status: validTypes.includes(f.type) ? 'pending' : 'error',
            error: validTypes.includes(f.type) ? undefined : 'Unsupported file type. Use PDF, DOCX, CSV, TXT, or Image.'
        }));

        setFiles(prev => [...prev, ...mappedFiles]);
    };

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleSubmit = async () => {
        if (!clientName.trim() || files.filter(f => f.status === 'pending').length === 0) return;

        setIsSubmitting(true);

        // We will process files sequentially to avoid hitting Vercel payload limits
        // and easily track per-file progress
        const pendingFiles = files.filter(f => f.status === 'pending');
        let hasError = false;

        for (const f of pendingFiles) {
            setFiles(prev => prev.map(pf => pf.id === f.id ? { ...pf, status: 'uploading', progress: 50 } : pf));

            const formData = new FormData();
            formData.append('clientName', clientName);
            formData.append('file', f.file);

            try {
                const response = await fetch('/api/documents/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorPayload = await response.json();
                    throw new Error(errorPayload.error || 'Upload failed');
                }

                setFiles(prev => prev.map(pf => pf.id === f.id ? { ...pf, status: 'success', progress: 100 } : pf));
            } catch (err: unknown) {
                hasError = true;
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                setFiles(prev => prev.map(pf => pf.id === f.id ? { ...pf, status: 'error', progress: 0, error: errorMessage } : pf));
            }
        }

        setIsSubmitting(false);

        if (!hasError) {
            // Small delay to show success states before redirecting
            setTimeout(() => {
                router.push('/dashboard');
                router.refresh();
            }, 1000);
        }
    };

    return (
        <div className="max-w-3xl mx-auto flex flex-col gap-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">Upload Client Documents</h1>
                <p className="text-slate-400">
                    Upload onboarding forms to be analysed by the AI consultant. Each file is treated as a separate document analysis.
                </p>
            </div>

            <div className="glass-card p-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Who is this client?
                </label>
                <input
                    type="text"
                    placeholder="e.g. Acme Corp Operations"
                    className="input text-lg py-3"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    disabled={isSubmitting}
                />
                <p className="text-xs text-slate-500 mt-2">
                    This will create a new client profile or add documents to an existing one with the exact same name.
                </p>
            </div>

            <div
                className={cn(
                    "glass-card p-12 border-2 border-dashed flex flex-col items-center justify-center text-center transition-all cursor-pointer",
                    isDragActive ? "border-blue-500 bg-blue-500/5 scale-[1.02]" : "border-[var(--border)] hover:border-[var(--border-hover)]"
                )}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isSubmitting && fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    multiple
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileInput}
                    accept=".pdf,.docx,.doc,.txt,.csv,image/jpeg,image/png,image/webp"
                />
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400">
                    <UploadCloud size={32} />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Click or drag files to upload</h3>
                <p className="text-slate-400 text-sm max-w-sm">
                    Supported formats: PDF, DOCX, CSV, TXT, JPEG, PNG, WEBP.
                    <br className="hidden sm:block" />
                    <span className="text-amber-400">Please upload each onboarding response file as a separate document.</span>
                </p>
            </div>

            {files.length > 0 && (
                <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-medium text-slate-300 mb-2">Selected Files ({files.length})</h3>
                    {files.map(f => (
                        <div key={f.id} className="glass-card p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center shrink-0">
                                <File size={20} className={getFileType(f.file.name) === 'pdf' ? 'text-red-400' : getFileType(f.file.name) === 'docx' ? 'text-blue-400' : 'text-emerald-400'} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between mb-1">
                                    <p className="text-sm font-medium text-white truncate pr-4">{f.file.name}</p>
                                    <span className="text-xs text-slate-400">{formatFileSize(f.file.size)}</span>
                                </div>
                                {f.status === 'error' ? (
                                    <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                                        <AlertCircle size={12} /> {f.error}
                                    </p>
                                ) : (
                                    <div className="h-1.5 w-full bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full transition-all duration-300", f.status === 'success' ? 'bg-emerald-500' : 'bg-blue-500')}
                                            style={{ width: `${f.progress}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="shrink-0 flex items-center">
                                {f.status === 'success' && <CheckCircle2 size={20} className="text-emerald-500" />}
                                {f.status === 'uploading' && <Loader2 size={20} className="text-blue-400 animate-spin" />}
                                {f.status === 'pending' && !isSubmitting && (
                                    <button onClick={(e) => { e.stopPropagation(); removeFile(f.id); }} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-end mt-4">
                        <button
                            className="btn-primary px-8"
                            onClick={handleSubmit}
                            disabled={isSubmitting || !clientName.trim() || files.filter(f => f.status === 'pending').length === 0}
                        >
                            {isSubmitting ? (
                                <><Loader2 size={18} className="animate-spin" /> Uploading & Translating…</>
                            ) : (
                                'Upload & Analyse Documents'
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
