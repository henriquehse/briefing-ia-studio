'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

interface HeaderProps {
    showBackButton?: boolean;
    backUrl?: string;
}

export default function Header({ showBackButton = false, backUrl = '/dashboard' }: HeaderProps) {
    const { data: session } = useSession();

    return (
        <header className="glass-card shadow-2xl sticky top-0 z-50 backdrop-blur-xl">
            <div className="container mx-auto px-8 py-6">
                <div className="flex items-center justify-between">
                    {/* Left: Logo + Back Button */}
                    <div className="flex items-center gap-6 animate-fade-in">
                        <Link href="/dashboard" className="flex items-center">
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent hover:scale-105 transition-transform">
                                Briefing IA Studio
                            </h1>
                        </Link>
                        {showBackButton && (
                            <Link
                                href={backUrl}
                                className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
                            >
                                ← Voltar
                            </Link>
                        )}
                    </div>

                    {/* Right: User Info + Logout */}
                    {session && (
                        <div className="flex items-center gap-6 animate-slide-down">
                            <span className="hidden md:block text-base text-slate-600 font-medium">
                                {session.user?.email}
                            </span>
                            <button
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="btn-secondary text-sm md:text-base"
                            >
                                Sair
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
