import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
    title: 'Briefing IA Studio | Sistema Inteligente de Briefing',
    description: 'Plataforma inteligente com Gemini AI para criar briefings completos e copy de alto impacto.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <body className="antialiased bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
