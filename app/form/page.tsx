'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ADAPTIVE_FORM_SYSTEM } from '@/lib/prompts/system';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function FormPage() {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'Olá! 👋 Vou ajudá-lo a criar um briefing completo. Que tipo de ativo digital você precisa?',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToTop = () => {
        messagesContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Detectar scroll para mostrar botão "Voltar ao topo"
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            setShowScrollTop(container.scrollTop > 300);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    // Mostrar botões de ação após 10 mensagens
    useEffect(() => {
        if (messages.length >= 10) {
            setShowActions(true);
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/gemini/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: input,
                    systemPrompt: ADAPTIVE_FORM_SYSTEM,
                }),
            });

            const data = await response.json();

            if (data.success) {
                await new Promise(resolve => setTimeout(resolve, 500));

                const assistantMessage: Message = {
                    role: 'assistant',
                    content: data.response,
                    timestamp: new Date()
                };
                setMessages((prev) => [...prev, assistantMessage]);
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            const errorMessage: Message = {
                role: 'assistant',
                content: '😔 Erro. Tente novamente.',
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateCopy = () => {
        const briefing = messages
            .filter(msg => msg.role === 'assistant')
            .map(msg => msg.content)
            .join('\n\n');

        localStorage.setItem('briefingContext', briefing);
        router.push('/copy-lab?from=form');
    };

    const handleDownloadBriefing = () => {
        const briefing = messages
            .map(msg => `[${msg.role.toUpperCase()}]: ${msg.content}`)
            .join('\n\n');

        const blob = new Blob([briefing], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `briefing-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex flex-col">
            {/* Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:70px_70px]"></div>

            {/* Orbs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-float"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }}></div>

            {/* Header */}
            <header className="relative z-10 backdrop-blur-xl bg-white/5 border-b border-white/10">
                <div className="container mx-auto px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Link href="/dashboard" className="group flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                                <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                <span className="text-lg font-medium">Voltar</span>
                            </Link>

                            <div className="h-8 w-px bg-white/10"></div>

                            <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Formulário IA
                            </h1>
                        </div>

                        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-slate-300 font-medium text-sm">Gemini 2.5 Pro</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Messages */}
            <main
                ref={messagesContainerRef}
                className="relative z-10 flex-1 overflow-y-auto px-8 py-8"
            >
                <div className="container mx-auto max-w-4xl space-y-6">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 animate-slide-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-xl flex-shrink-0">
                                    <span className="text-2xl">🤖</span>
                                </div>
                            )}

                            <div className={`max-w-[75%] rounded-3xl p-6 shadow-2xl ${msg.role === 'user'
                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                                    : 'bg-white/5 backdrop-blur-xl border border-white/10 text-slate-100'
                                }`}>
                                <p className="text-lg leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-500'}`}>
                                    {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center shadow-xl flex-shrink-0">
                                    <span className="text-2xl">👤</span>
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div className="flex gap-4 animate-pulse">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-xl">
                                <span className="text-2xl">🤖</span>
                            </div>
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 bg-slate-500 rounded-full animate-bounce"></div>
                                    <div className="w-3 h-3 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-3 h-3 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {showActions && !loading && (
                        <div className="flex gap-4 justify-center py-6 animate-slide-up">
                            <button
                                onClick={handleDownloadBriefing}
                                className="px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all duration-300 flex items-center gap-2 font-semibold"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Baixar Briefing
                            </button>

                            <button
                                onClick={handleGenerateCopy}
                                className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-500 text-white rounded-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2 font-bold shadow-xl"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Gerar Copy Agora
                            </button>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Scroll to Top Button */}
                {showScrollTop && (
                    <button
                        onClick={scrollToTop}
                        className="fixed bottom-32 right-8 group p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 animate-slide-up z-50"
                        title="Voltar ao topo"
                    >
                        <svg className="w-6 h-6 text-white group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </button>
                )}
            </main>

            {/* Input */}
            <div className="relative z-10 border-t border-white/10 backdrop-blur-xl bg-white/5 p-8">
                <form onSubmit={handleSubmit} className="container mx-auto max-w-4xl">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>

                        <div className="relative flex gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                                placeholder="Digite sua mensagem... (Shift+Enter para nova linha)"
                                className="flex-1 bg-transparent text-white placeholder-slate-500 text-lg outline-none resize-none min-h-[60px] max-h-[200px]"
                                disabled={loading}
                            />

                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="group/btn relative px-8 py-4 rounded-2xl overflow-hidden disabled:opacity-50 transition-all duration-300 hover:scale-105 flex-shrink-0"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] group-hover/btn:bg-[position:100%_0] transition-all duration-700"></div>

                                <span className="relative z-10 text-white font-bold text-lg">
                                    Enviar
                                </span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
