'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const cards = [
    {
      title: 'Onboarding',
      emoji: '🚀',
      description: 'Configure sua API key e informações essenciais para começar',
      href: '/onboarding',
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      iconBg: 'bg-blue-500/20',
    },
    {
      title: 'Formulário IA',
      emoji: '🤖',
      description: 'Chat conversacional para criar briefings completos',
      href: '/form',
      gradient: 'from-orange-500 via-amber-500 to-yellow-500',
      iconBg: 'bg-orange-500/20',
    },
    {
      title: 'Copy Lab',
      emoji: '✨',
      description: 'Análise de arquivos e geração de copy profissional',
      href: '/copy-lab',
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
      iconBg: 'bg-violet-500/20',
    },
  ];

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-slate-300 flex items-center gap-3">
          <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg font-medium">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 overflow-hidden">
      {/* Formas decorativas de fundo suavizadas */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/8 rounded-full blur-3xl animate-pulse animation-delay-4000" />

      {/* Header com glassmorphism */}
      <header className="relative z-10 border-b border-slate-700/50 backdrop-blur-xl bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                  Briefing IA
                </h1>
                <p className="text-xs text-slate-500">Sistema Inteligente</p>
              </div>
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-slate-300">{session?.user?.name || 'Usuário'}</p>
                <p className="text-xs text-slate-500">{session?.user?.email}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="px-4 py-2 bg-slate-800/60 hover:bg-red-500/20 border border-slate-700/50 hover:border-red-500/30 rounded-lg text-slate-300 hover:text-red-400 text-sm font-medium transition-all duration-300 hover:shadow-[0_4px_20px_rgba(239,68,68,0.2)]"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-100">
            Escolha Sua Ferramenta
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Crie briefings inteligentes e copy de alto impacto com IA
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {cards.map((card, index) => (
            <Link
              key={card.href}
              href={card.href}
              className="group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Card com glassmorphism */}
              <div className="relative h-full bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 transition-all duration-500 hover:bg-slate-900/70 hover:border-slate-600/60 hover:shadow-[0_8px_32px_rgba(59,130,246,0.15)] hover:scale-[1.02] hover:-translate-y-1">
                {/* Gradiente sutil no hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                {/* Conteúdo do Card */}
                <div className="relative z-10 space-y-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 ${card.iconBg} backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}>
                    {card.emoji}
                  </div>

                  {/* Text Content */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-100 group-hover:text-white transition-colors duration-300">
                      {card.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                      {card.description}
                    </p>
                  </div>

                  {/* Arrow Icon */}
                  <div className="flex items-center text-slate-500 group-hover:text-blue-400 transition-all duration-300">
                    <span className="text-sm font-medium mr-2">Acessar</span>
                    <svg 
                      className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>

                {/* Borda brilhante sutil no hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${card.gradient} opacity-20 blur-xl`} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-slate-400">Sistema Online</span>
          </div>
          <p className="text-xs text-slate-600">
            Powered by Gemini 2.5 Pro • Next.js 15 • React 19
          </p>
        </div>
      </main>

      {/* Estilos customizados */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.6;
          }
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
