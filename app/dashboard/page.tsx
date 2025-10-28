'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session } = useSession();

  const cards = [
    {
      title: 'Onboarding',
      emoji: '🚀',
      description: 'Configure sua API key e informações essenciais para começar',
      href: '/onboarding',
      gradient: 'from-blue-600 via-blue-500 to-cyan-500',
      delay: '0s',
    },
    {
      title: 'Formulário IA',
      description: 'Chat conversacional para criar briefings completos',
      icon: '🤖',
      href: '/form',
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'Copy Lab',
      description: 'Análise de arquivos e geração de copy',
      icon: '✨',
      href: '/copy-lab',
      color: 'from-blue-500 to-purple-500'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Briefing IA Studio
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">{session?.user?.email}</span>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-bold mb-4">
            Escolha Sua Ferramenta
          </h2>
          <p className="text-slate-400 text-lg">
            Crie briefings inteligentes e copy de alto impacto com IA
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {cards.map((card, index) => (
            <Link
              key={index}
              href={card.href}
              className="group relative bg-slate-900/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 hover:border-orange-500/50 transition-all duration-300 hover:scale-105"
            >
              <div className={`text-6xl mb-4 ${card.icon ? '' : 'animate-bounce'}`}>
                {card.icon || card.emoji}
              </div>
              <h3 className="text-2xl font-bold mb-2">{card.title}</h3>
              <p className="text-slate-400 mb-4">{card.description}</p>
              <div className="text-orange-400 font-semibold group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                Acessar →
              </div>
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-12">
          {[
            { label: '100%', sublabel: 'Funcional' },
            { label: '2.5 Pro', sublabel: 'Gemini Avançado' },
            { label: 'Next 15', sublabel: 'React 19' },
            { label: '✨', sublabel: 'IA Generativa' },
          ].map((stat, i) => (
            <div key={i} className="text-center bg-slate-900/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-400">{stat.label}</div>
              <div className="text-sm text-slate-500">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
