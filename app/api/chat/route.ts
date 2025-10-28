import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { messages, references } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Mensagens são obrigatórias' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key do Gemini não configurada' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const referencesContext = references && references.length > 0
      ? `\n\nREFERÊNCIAS FORNECIDAS:\n${references.map((ref: any, i: number) => 
          `Referência ${i + 1} - ${ref.name}:\n${ref.content}`
        ).join('\n\n')}\n\n`
      : '';

    // System prompt sem markdown
    const systemPrompt = `Você é um assistente especialista em criar briefings e documentações profissionais.

IMPORTANTE - REGRAS DE FORMATAÇÃO:
- NÃO use markdown na conversa (sem **, ##, ###, -, *, >, etc)
- Escreva em texto puro e limpo, como numa conversa natural
- Use apenas emojis ocasionais para dar vida à conversa
- Quebre linhas normalmente quando necessário
- Seja conversacional, amigável e direto

SUAS CAPACIDADES:
- Fazer perguntas estratégicas para entender melhor o projeto
- Sugerir pesquisas na internet quando necessário
- Incorporar referências fornecidas pelo usuário
- Manter o contexto de toda a conversa
- Ao final, consolidar tudo em um documento profissional (aí sim com markdown)

DIRETRIZES DE CONVERSA:
- Seja natural e amigável
- Faça perguntas específicas e relevantes
- Se o usuário mencionar algo vago, peça detalhes
- Quando tiver informações suficientes, ofereça gerar o briefing final
- Mantenha sempre o contexto de toda a conversa anterior

${referencesContext}

LEMBRE-SE: Na conversa seja natural e limpo. O markdown só será usado no documento final que o usuário vai baixar.`;

    const chatHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: 'Olá! 👋 Estou aqui para ajudar você a criar um briefing profissional. Vamos começar!' }],
        },
        ...chatHistory,
      ],
    });

    const result = await chat.sendMessageStream(lastMessage.content);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Erro no chat:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao processar mensagem',
        details: error?.message || 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
