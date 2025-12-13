'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
    const router = useRouter();
    const { register, isLoading, error, clearError } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        clearError();

        if (!email || !password) {
            setFormError('Please fill in all fields');
            return;
        }

        if (password.length < 8) {
            setFormError('Password must be at least 8 characters');
            return;
        }

        try {
            await register(email, password);
            router.push('/chat');
        } catch (err) {
            // Error is already set in store
            console.error('Registration failed:', err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-paper px-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-semibold text-ink">SkySearch</span>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-white border border-border rounded-xl p-6">
                    <h1 className="text-xl font-semibold text-ink mb-1">Create account</h1>
                    <p className="text-sm text-muted mb-6">
                        Start finding the best flights with AI
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />

                        <div>
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                            <p className="text-xs text-muted mt-1">
                                Must be at least 8 characters
                            </p>
                        </div>

                        {(formError || error) && (
                            <p className="text-sm text-error">{formError || error}</p>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            Create account
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted mt-6">
                        Already have an account?{' '}
                        <Link href="/login" className="text-accent hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>

                {/* Skip Registration */}
                <p className="text-center text-sm text-muted mt-4">
                    <Link href="/chat" className="hover:underline">
                        Continue without account →
                    </Link>
                </p>
            </div>
        </div>
    );
}
