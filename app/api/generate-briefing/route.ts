import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages, references } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key do Gemini não configurada' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Consolidar toda a conversa
    const conversationContext = messages
      .map((msg: any) => `**${msg.role === 'user' ? 'Usuário' : 'Assistente'}:** ${msg.content}`)
      .join('\n\n');

    const referencesContext = references && references.length > 0
      ? `\n\n## REFERÊNCIAS FORNECIDAS:\n${references.map((ref: any, i: number) => 
          `\n### ${ref.name}\n${ref.content}`
        ).join('\n\n')}\n\n`
      : '';

    const prompt = `# MISSÃO: Criar Briefing Profissional Completo

## CONTEXTO DA CONVERSA:
${conversationContext}

${referencesContext}

---

**TAREFA FINAL:**
Com base em TODA a conversa acima e nas referências fornecidas, crie um briefing/documentação PROFISSIONAL, COMPLETO e ESTRUTURADO em formato Markdown.

**ESTRUTURA REQUERIDA:**
1. **Título Principal** (# H1)
2. **Resumo Executivo** - Síntese do projeto em 2-3 parágrafos
3. **Objetivos** - Lista clara e mensurável
4. **Público-Alvo** - Detalhamento de personas/segmentos
5. **Contexto e Background** - Informações relevantes do mercado/situação
6. **Escopo** - O que está incluído e excluído
7. **Requisitos** - Técnicos, de conteúdo, de design, etc.
8. **Diferenciais** - O que torna este projeto único
9. **Tom e Voz** - Guidelines de comunicação
10. **Referências e Inspirações** - Baseado no que foi discutido
11. **Cronograma** (se aplicável) - Prazos e marcos
12. **Métricas de Sucesso** - Como medir o resultado
13. **Próximos Passos** - Ações concretas

**FORMATAÇÃO:**
- Use Markdown profissional
- Títulos hierárquicos (##, ###)
- Listas para clareza
- **Negrito** para ênfase
- Blocos de código quando técnico
- Quotes para citações importantes

**IMPORTANTE:**
- Seja COMPLETO e DETALHADO
- Use TODAS as informações da conversa
- Integre as referências naturalmente
- Mantenha tom profissional mas acessível
- Crie um documento pronto para uso imediato

Gere o briefing completo agora:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const briefing = response.text();

    return NextResponse.json({
      success: true,
      briefing,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Erro ao gerar briefing:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro ao gerar briefing',
        details: error?.message || 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
