'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { register, type ActionState } from '../actions';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

const initialState: ActionState = { error: '', redirect: '' };

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button type="submit" className="btn-primary w-full mt-6" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="animate-spin" size={18} />
                    Creating account...
                </>
            ) : (
                'Create account'
            )}
        </button>
    );
}

export default function RegisterPage() {
    const router = useRouter();
    const [state, formAction] = useActionState(register, initialState);

    useEffect(() => {
        if (state?.redirect) {
            router.push(state.redirect);
        }
    }, [state, router]);
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="glass-card w-full max-w-md p-8 animate-fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold gradient-text mb-2">Join CinaTech</h1>
                    <p className="text-sm text-slate-400">
                        Create an account to start analysing client forms
                    </p>
                </div>

                <form action={formAction} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="fullName">
                                Full name
                            </label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                autoComplete="name"
                                required
                                className="input"
                                placeholder="Jane Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="agencyName">
                                Agency name
                            </label>
                            <input
                                id="agencyName"
                                name="agencyName"
                                type="text"
                                required
                                className="input"
                                placeholder="Acme Corp"
                            />
                        </div>
                    </div>

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
                            autoComplete="new-password"
                            required
                            minLength={6}
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

                <p className="mt-6 text-center text-sm text-slate-400">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-400 hover:text-blue-300 underline underline-offset-4">
                        Sign in here
                    </Link>
                </p>
            </div>
        </div>
    );
}
