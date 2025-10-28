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
      console.log('🔐 Tentando fazer login...');
      
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      console.log('📡 Resultado do signIn:', result);

      if (result?.error) {
        setError('Credenciais inválidas. Tente novamente.');
        console.error('❌ Erro de login:', result.error);
      } else if (result?.ok) {
        console.log('✅ Login bem-sucedido, redirecionando...');
        router.push('/dashboard');
      } else {
        setError('Ocorreu um erro inesperado durante o login.');
        console.error('❌ Resultado inesperado:', result);
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
      console.error('❌ Erro no onSubmit:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Formas de fundo suavizadas */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
      
      {/* Conteúdo Centralizado */}
      <div className="relative z-10 w-full max-w-md">
        {/* Título */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-blue-300 to-violet-400 bg-clip-text text-transparent drop-shadow-sm">
            Briefing IA
          </h1>
          <p className="text-slate-400 text-sm font-medium tracking-wide">
            Sistema Inteligente de Briefing
          </p>
        </div>

        {/* Card de Login Elegante */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8 transition-all duration-500 hover:bg-slate-900/80 hover:border-slate-600/60 hover:shadow-[0_8px_32px_rgba(59,130,246,0.15)]">
          <h2 className="text-2xl font-semibold text-slate-100 mb-6">
            Acessar sua conta
          </h2>

          {/* Mensagem de Erro */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 rounded-lg text-red-300 text-sm backdrop-blur-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 hover:bg-slate-800/80 hover:border-slate-500/60"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Campo Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                {...register('password')}
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 hover:bg-slate-800/80 hover:border-slate-500/60"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Botão de Envio com efeito suave */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg transition-all duration-300 hover:from-blue-500 hover:to-blue-400 hover:shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Info Footer */}
          <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-xs text-slate-500">
              Powered by <span className="text-blue-400 font-medium">Gemini 2.5 Pro</span>
            </p>
          </div>
        </div>

        {/* Info Adicional */}
        <p className="mt-6 text-center text-xs text-slate-600">
          Next.js 15 • React 19 • TypeScript • Tailwind CSS
        </p>
      </div>

      {/* Estilos para animação com delay */}
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
      `}</style>
    </div>
  );
}
