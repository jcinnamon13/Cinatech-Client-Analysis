// ─── Database Row Types ───────────────────────────────────────────────────────

export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    agency_name: string | null;
    created_at: string;
}

export interface Client {
    id: string;
    user_id: string;
    name: string;
    created_at: string;
    is_shared: boolean;
}

export type DocumentStatus = 'uploading' | 'analysing' | 'ready' | 'error';
export type DocumentFileType = 'pdf' | 'docx' | 'image';

export interface Document {
    id: string;
    client_id: string;
    user_id: string;
    file_name: string;
    file_path: string;
    file_type: DocumentFileType;
    status: DocumentStatus;
    share_token: string;
    share_expires_at: string | null;
    created_at: string;
    // Joined
    clients?: Client;
}

// ─── AI Analysis Types ────────────────────────────────────────────────────────

export interface QAPair {
    question: string;
    original_response: string;
    improved_response: string;
    recommendations: string[];
    flags: string[];
}

export interface AnalysisResult {
    qa_pairs: QAPair[];
    executive_summary: string;
    overall_score: number; // 0–100
    priority_actions: string[];
}

export interface Analysis {
    id: string;
    document_id: string;
    version: number;
    structured_result: AnalysisResult;
    summary: string;
    created_at: string;
}

// ─── Structured Analysis Types ────────────────────────────────────────────────

export interface Pillar {
    question: string;
    original_response: string;
    improved_response: string;
    recommendations: string[];
    flags: string[];
}

export interface ActionItem {
    action: string;
    owner: string;
    deadline: string;
    pillar: string;
    consequence: string;
}

export interface StructuredResult {
    pillars: Pillar[];
    priority_action_plan: ActionItem[];
}

// ─── Export Types ─────────────────────────────────────────────────────────────

export type ExportType = 'google_doc' | 'pdf';

export interface Export {
    id: string;
    document_id: string;
    analysis_id: string;
    type: ExportType;
    url: string;
    created_at: string;
}

// ─── UI / View Types ──────────────────────────────────────────────────────────

export interface ClientWithDocuments extends Client {
    documents: Document[];
}

export interface DocumentWithAnalysis extends Document {
    analyses: Analysis[];
    latest_analysis?: Analysis;
}

// ─── API Response Types ────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
    data?: T;
    error?: string;
}

export interface UploadDocumentResponse {
    document: Document;
    client: Client;
}

export interface AnalyseDocumentResponse {
    analysis: Analysis;
}

export interface ExportDocumentResponse {
    url: string;
    type: ExportType;
}

export interface ShareDocumentResponse {
    share_url: string;
    share_token: string;
}
