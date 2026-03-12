'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, type ActionState } from '../actions';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

const initialState: ActionState = { error: '', redirect: '' };

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button type="submit" className="btn-primary w-full mt-4" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="animate-spin" size={18} />
                    Signing in...
                </>
            ) : (
                'Sign in'
            )}
        </button>
    );
}

export default function LoginPage() {
    const router = useRouter();
    const [state, formAction] = useActionState(login, initialState);

    useEffect(() => {
        if (state?.redirect) {
            router.push(state.redirect);
        }
    }, [state, router]);
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="glass-card w-full max-w-md p-8 animate-fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold gradient-text mb-2">Welcome back</h1>
                    <p className="text-sm text-slate-400">
                        Sign in to access your client analysis dashboard
                    </p>
                </div>

                <form action={formAction} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="email">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="input"
                            placeholder="you@agency.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="input"
                            placeholder="••••••••"
                        />
                    </div>

                    {state?.error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg mt-2">
                            {state.error}
                        </div>
                    )}

                    <SubmitButton />
                </form>

                <p className="text-center text-sm text-slate-400">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="text-white hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
