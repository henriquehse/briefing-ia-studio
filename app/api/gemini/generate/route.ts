import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { prompt, systemPrompt } = body;

        if (!prompt) {
            return NextResponse.json(
                { error: 'Prompt é obrigatório' },
                { status: 400 }
            );
        }

        // Combinar system prompt com o prompt do usuário
        const fullPrompt = systemPrompt
            ? `${systemPrompt}\n\nUsuário: ${prompt}`
            : prompt;

        // Gerar conteúdo com Gemini
        const response = await generateContent(fullPrompt);

        return NextResponse.json({
            response,
            success: true
        });

    } catch (error: any) {
        console.error('Erro na API Gemini:', error);
        return NextResponse.json(
            {
                error: 'Erro ao gerar conteúdo',
                details: error.message
            },
            { status: 500 }
        );
    }
}
