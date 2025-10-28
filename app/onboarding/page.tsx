'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema, type OnboardingFormData } from '@/lib/schemas';
import Link from 'next/link';

export default function OnboardingPage() {
    const router = useRouter();
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<OnboardingFormData>({
        resolver: zodResolver(onboardingSchema),
    });

    const onSubmit = async (data: OnboardingFormData) => {
        localStorage.setItem('userOnboarding', JSON.stringify(data));
        setSuccess(true);
        setTimeout(() => router.push('/dashboard'), 2000);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-3xl blur-xl animate-pulse"></div>
                    <div className="relative bg-slate-800/50 backdrop-blur-2xl border border-emerald-500/20 p-12 rounded-3xl text-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                            <span className="text-white text-5xl">✓</span>
                        </div>
                        <h2 className="text-4xl font-black text-white mb-4">
                            Pronto!
                        </h2>
                        <p className="text-xl text-slate-300">
                            Redirecionando...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
            {/* Background Grid Sutil */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:70px_70px]"></div>

            {/* Orbs Sutis */}
            <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[150px]"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-[150px]"></div>

            {/* Header */}
            <header className="relative z-10 backdrop-blur-xl bg-slate-800/30 border-b border-white/10">
                <div className="container mx-auto px-8 py-6">
                    <Link href="/dashboard" className="group flex items-center gap-3 text-slate-400 hover:text-emerald-400 transition-colors">
                        <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="text-lg font-semibold">Voltar ao Dashboard</span>
                    </Link>
                </div>
            </header>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-8 py-20 max-w-3xl">
                {/* Title */}
                <div className="mb-16 text-center animate-fade-in">
                    <h1 className="text-6xl md:text-7xl font-black text-white mb-6">
                        Configure Sua Conta
                    </h1>
                    <p className="text-2xl text-slate-400 font-light">
                        Preencha seus dados para começar
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="relative group animate-scale-in">
                    {/* Glow Sutil */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                    <div className="relative bg-slate-800/50 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-10 md:p-12 space-y-8">
                        {/* Nome */}
                        <div>
                            <label htmlFor="name" className="block text-2xl font-black text-white mb-4">
                                Nome Completo
                            </label>
                            <input
                                id="name"
                                type="text"
                                {...register('name')}
                                placeholder="Seu nome completo"
                                className="w-full px-6 py-5 text-lg bg-slate-900/50 border-2 border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 outline-none hover:border-slate-600"
                            />
                            {errors.name && (
                                <p className="text-red-400 text-base mt-2 ml-2">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-2xl font-black text-white mb-4">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                {...register('email')}
                                placeholder="seu@email.com"
                                className="w-full px-6 py-5 text-lg bg-slate-900/50 border-2 border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 outline-none hover:border-slate-600"
                            />
                            {errors.email && (
                                <p className="text-red-400 text-base mt-2 ml-2">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Empresa */}
                        <div>
                            <label htmlFor="company" className="block text-2xl font-black text-white mb-4">
                                Empresa <span className="text-slate-500 font-normal text-lg">(Opcional)</span>
                            </label>
                            <input
                                id="company"
                                type="text"
                                {...register('companyName')}
                                placeholder="Nome da sua empresa"
                                className="w-full px-6 py-5 text-lg bg-slate-900/50 border-2 border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 outline-none hover:border-slate-600"
                            />
                        </div>

                        {/* API Key */}
                        <div>
                            <label htmlFor="geminiApiKey" className="block text-2xl font-black text-white mb-4">
                                API Key do Gemini
                            </label>
                            <input
                                id="geminiApiKey"
                                type="password"
                                {...register('geminiApiKey')}
                                placeholder="Sua chave da API Gemini"
                                className="w-full px-6 py-5 text-lg bg-slate-900/50 border-2 border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 outline-none hover:border-slate-600"
                            />
                            {errors.geminiApiKey && (
                                <p className="text-red-400 text-base mt-2 ml-2">{errors.geminiApiKey.message}</p>
                            )}
                            <p className="text-slate-400 text-base mt-3 ml-2">
                                Obtenha sua chave em{' '}
                                <a
                                    href="https://aistudio.google.com/apikey"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-400 hover:text-emerald-300 underline font-semibold"
                                >
                                    Google AI Studio
                                </a>
                            </p>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="group/btn relative w-full py-6 text-xl font-bold rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500 group-hover/btn:shadow-2xl group-hover/btn:shadow-emerald-500/50 transition-all duration-500"></div>

                            <span className="relative z-10 text-white flex items-center justify-center gap-3">
                                Salvar Configurações
                                <svg className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
