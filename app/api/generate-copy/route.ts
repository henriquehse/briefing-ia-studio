import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userInfo, agentDirective, documentationContent } = await request.json();

    // Validação básica
    if (!userInfo || !agentDirective) {
      return NextResponse.json(
        { error: 'Informações do usuário e diretiva são obrigatórios' },
        { status: 400 }
      );
    }

    // Inicializar Gemini AI
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key do Gemini não configurada' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Criar prompt estruturado com blend de documentação
    const documentationSection = documentationContent 
      ? `## Documentação de Referência Consolidada\n${documentationContent}\n\n`
      : '';

    const prompt = `
# Missão: Criar Copy Profissional e Persuasiva

## Contexto do Usuário
${userInfo}

## Diretiva do Agente
${agentDirective}

${documentationSection}

---

**INSTRUÇÕES SUPREMAS:**

Com base nas informações fornecidas, crie uma copy EXTRAORDINÁRIA seguindo estas diretrizes:

### Estrutura e Organização
- Use hierarquia clara com títulos H1, H2 e H3
- Organize em seções lógicas e escaneáveis
- Crie parágrafos curtos e impactantes

### Tom e Voz
- Ajuste o tom conforme a diretiva do agente
- Mantenha consistência com a documentação de referência
- Use linguagem persuasiva mas autêntica

### Conteúdo Estratégico
- Headlines magnéticas que capturam atenção
- Storytelling envolvente quando apropriado
- Benefícios claros e orientados a resultados
- Proof points e credibilidade (estatísticas, depoimentos, casos)
- CTAs estratégicos e persuasivos

### Formatação Markdown
- **Negrito** para ênfase em pontos-chave
- *Itálico* para sutileza
- Listas para facilitar escaneamento
- Blocos de código quando técnico
- Quotes para depoimentos ou citações

### SEO e Otimização
- Palavras-chave integradas naturalmente
- Meta descrições implícitas
- Estrutura amigável para mecanismos de busca

### Blend de Documentação
${documentationContent ? '- Integre TODOS os insights da documentação fornecida\n- Faça síntese inteligente de múltiplas fontes\n- Identifique padrões e temas recorrentes\n- Use exemplos e referências dos documentos' : ''}

**RESULTADO ESPERADO:**
Uma copy completa, profissional e pronta para uso que integra perfeitamente todas as informações fornecidas e gera máximo impacto.

Gere a copy em formato Markdown profissional:
`;

    // Gerar conteúdo
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedCopy = response.text();

    return NextResponse.json({
      success: true,
      copy: generatedCopy,
      timestamp: new Date().toISOString(),
      filesProcessed: documentationContent ? true : false,
    });

  } catch (error: any) {
    console.error('Erro ao gerar copy:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro ao processar solicitação',
        details: error?.message || 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
