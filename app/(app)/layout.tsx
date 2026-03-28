import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FileUp, Users, LogOut } from 'lucide-react';
import { logout } from '../(auth)/actions';

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch the user's profile to display their name
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, agency_name')
        .eq('id', user.id)
        .single();

    return (
        <div className="flex min-h-screen bg-[var(--bg-primary)]">
            {/* Sidebar */}
            <aside className="w-64 border-r border-[var(--border)] bg-[var(--bg-secondary)] flex flex-col hidden md:flex">
                <div className="p-6 border-b border-[var(--border)]">
                    <h2 className="font-bold text-lg tracking-tight gradient-text">CinaTech</h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Client Analysis Portal</p>
                </div>

                <nav className="flex-1 p-4 flex flex-col gap-2">
                    <Link href="/dashboard" className="sidebar-link hover:bg-[var(--bg-hover)] active">
                        <LayoutDashboard size={18} />
                        Dashboard
                    </Link>
                    <Link href="/upload" className="sidebar-link hover:bg-[var(--bg-hover)]">
                        <FileUp size={18} />
                        Upload Forms
                    </Link>
                    <Link href="/clients" className="sidebar-link hover:bg-[var(--bg-hover)]">
                        <Users size={18} />
                        Clients Database
                    </Link>
                </nav>

                <div className="p-4 border-t border-[var(--border)]">
                    <div className="mb-4 px-2">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{profile?.full_name || user.email}</p>
                        <p className="text-xs text-[var(--text-secondary)] truncate">{profile?.agency_name || 'Agency'}</p>
                    </div>
                    <form action={logout}>
                        <button type="submit" className="flex items-center gap-2 w-full px-2 py-2 text-sm text-[var(--accent-red)] hover:bg-red-400/10 rounded-lg transition-colors">
                            <LogOut size={16} />
                            Sign out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                    <h2 className="font-bold text-lg tracking-tight gradient-text">CinaTech</h2>
                    <form action={logout}>
                        <button type="submit" className="text-[var(--accent-red)] p-2 rounded-lg hover:bg-red-400/10">
                            <LogOut size={18} />
                        </button>
                    </form>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
                    <div className="max-w-6xl mx-auto w-full">
                        {children}
                    </div>
                </div>

                {/* Mobile Bottom Navigation — visible on small screens only */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-secondary)] border-t border-[var(--border)] flex items-stretch safe-area-pb">
                    <Link href="/dashboard" className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-xs">
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/upload" className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-xs">
                        <FileUp size={20} />
                        <span>Upload</span>
                    </Link>
                    <Link href="/clients" className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-xs">
                        <Users size={20} />
                        <span>Clients</span>
                    </Link>
                </nav>
            </main>
        </div>
    );
}
