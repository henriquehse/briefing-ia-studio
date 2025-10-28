'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/schemas';

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email: data.email,
                password: data.password,
            });

            if (result?.error) {
                setError('Credenciais inválidas. Tente novamente.');
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            setError('Erro ao fazer login. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
            {/* Animated Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:70px_70px] animate-pulse-soft"></div>

            {/* Floating Orbs */}
            <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-float"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '4s' }}></div>

            {/* Content */}
            <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
                <div className="w-full max-w-lg">
                    {/* Logo/Title */}
                    <div className="mb-12 text-center animate-fade-in">
                        <h1 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
                            Briefing IA
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-400 font-light tracking-wide">
                            Sistema Inteligente de Briefing
                        </p>
                    </div>

                    {/* Login Card - ULTRA PREMIUM */}
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="group relative animate-scale-in"
                    >
                        {/* Glow Effect on Hover */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-gradient bg-[length:200%_200%]"></div>

                        {/* Card */}
                        <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 md:p-12 shadow-2xl">
                            {/* Title */}
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
                                Bem-vindo de volta
                            </h2>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl animate-shake">
                                    <p className="text-red-300 text-center text-base">{error}</p>
                                </div>
                            )}

                            {/* Email Field */}
                            <div className="mb-8">
                                <label
                                    htmlFor="email"
                                    className="block text-lg font-semibold text-slate-300 mb-3"
                                >
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    {...register('email')}
                                    placeholder="seu@email.com"
                                    className="w-full px-6 py-5 text-lg bg-white/5 border-2 border-white/10 rounded-2xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 outline-none hover:border-white/20"
                                />
                                {errors.email && (
                                    <p className="text-red-400 text-base mt-2 ml-2">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="mb-10">
                                <label
                                    htmlFor="password"
                                    className="block text-lg font-semibold text-slate-300 mb-3"
                                >
                                    Senha
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    {...register('password')}
                                    placeholder="••••••••"
                                    className="w-full px-6 py-5 text-lg bg-white/5 border-2 border-white/10 rounded-2xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 outline-none hover:border-white/20"
                                />
                                {errors.password && (
                                    <p className="text-red-400 text-base mt-2 ml-2">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="group/btn relative w-full py-5 text-xl font-bold rounded-2xl overflow-hidden transition-all duration-500 disabled:opacity-50"
                            >
                                {/* Button Background - Animated Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] group-hover/btn:bg-[position:100%_0] transition-all duration-700"></div>

                                {/* Button Shine Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000"></div>

                                {/* Button Text */}
                                <span className="relative z-10 text-white flex items-center justify-center gap-3">
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Entrando...
                                        </>
                                    ) : (
                                        <>
                                            Entrar
                                            <svg className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </span>
                            </button>

                            {/* Footer Info */}
                            <p className="text-center text-slate-500 text-base mt-8">
                                Powered by <span className="text-blue-400 font-semibold">Gemini 2.5 Pro</span>
                            </p>
                        </div>
                    </form>

                    {/* Additional Info */}
                    <p className="text-center text-slate-500 text-base mt-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        Next.js 15 • React 19 • TypeScript • Tailwind CSS
                    </p>
                </div>
            </div>
        </div>
    );
}
