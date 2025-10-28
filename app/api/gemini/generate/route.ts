import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { COPY_ANALYSIS_SYSTEM } from '@/lib/prompts/copy'; // Reutiliza o prompt de sistema

// Validação básica da API Key (deve estar em .env.local ou nas variáveis de ambiente do Vercel)
if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não configurada.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configurações de segurança para o modelo Gemini
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Configurações de geração (opcional, ajuste conforme necessário)
const generationConfig = {
  // temperature: 0.7, // Exemplo: Controla a criatividade (0-1)
  // maxOutputTokens: 2048, // Exemplo: Limita o tamanho da resposta
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { directive, briefingContext, files } = body;

        // Validação básica de entrada
        if (!directive || typeof directive !== 'string' || directive.trim().length === 0) {
            return NextResponse.json(
                { error: 'A diretiva é obrigatória.' },
                { status: 400 }
            );
        }
        if (!briefingContext && (!files || !Array.isArray(files) || files.length === 0)) {
             return NextResponse.json(
                { error: 'É necessário fornecer o contexto do briefing ou pelo menos um arquivo.' },
                { status: 400 }
            );
        }

        // ---- Construção do Prompt para o Gemini ----
        let contextText = '';

        // 1. Adicionar contexto do briefing (se existir)
        if (briefingContext && typeof briefingContext === 'string' && briefingContext.trim().length > 0) {
            contextText += `--- CONTEXTO DO BRIEFING INICIAL ---\n${briefingContext}\n\n`;
        }

        // 2. Adicionar conteúdo dos arquivos (se existirem)
        if (files && Array.isArray(files) && files.length > 0) {
            contextText += `--- CONTEÚDO DOS DOCUMENTOS DE REFERÊNCIA ---\n`;
            files.forEach((file: { name?: string, content?: string }, index: number) => {
                if(file && file.content && typeof file.content === 'string') {
                    contextText += `\n[Arquivo ${index + 1}: ${file.name || 'Nome não fornecido'}]\n${file.content}\n------\n`;
                }
            });
            contextText += `\n`;
        }

        // 3. Montar o prompt final combinando o sistema, o contexto e a diretiva do usuário
        // Usamos a estrutura do prompt de sistema COPY_ANALYSIS_SYSTEM
        const fullPrompt = `
${COPY_ANALYSIS_SYSTEM}

--- DADOS FORNECIDOS ---

${contextText}

--- SUA TAREFA (DIRETIVA DO USUÁRIO) ---

${directive}

--- FIM DA TAREFA ---

Agora, com base em todo o contexto e na diretiva, gere a copy solicitada em formato Markdown.
`;

        // ---- Chamada ao Gemini ----
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-09-2025' }); // Ou use o modelo Pro se necessário
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
            safetySettings,
            generationConfig,
            // Adicione systemInstruction se quiser reforçar a persona separadamente
            // systemInstruction: { role: 'system', parts: [{ text: COPY_ANALYSIS_SYSTEM }] }
        });

        const response = result.response;

        if (!response) {
            console.error('Resposta da API Gemini vazia ou inesperada:', result);
            throw new Error('A IA não retornou uma resposta válida.');
        }

        // Verificar se houve bloqueio por segurança
         if (response.promptFeedback?.blockReason) {
             console.warn('Bloqueio por segurança:', response.promptFeedback.blockReason);
             return NextResponse.json(
                 { error: `A solicitação foi bloqueada por razões de segurança: ${response.promptFeedback.blockReason}. Tente reformular a diretiva ou o conteúdo dos arquivos.` },
                 { status: 400 }
             );
         }

        const generatedCopy = response.text();

        if (!generatedCopy) {
             throw new Error('A IA retornou uma resposta vazia.');
        }

        // ---- Retorno da API ----
        return NextResponse.json({
            copy: generatedCopy,
            success: true
        });

    } catch (error: any) {
        console.error('Erro na API /api/gemini/generate-copy:', error);
        // Tenta fornecer uma mensagem de erro mais útil
        let errorMessage = 'Erro ao gerar a copy com a IA.';
        if (error.message.includes('API key not valid')) {
            errorMessage = 'Erro de autenticação: Verifique sua GEMINI_API_KEY.';
        } else if (error.message.includes('quota')) {
             errorMessage = 'Erro: Limite de uso (quota) da API Gemini atingido.';
        } else if (error.message) {
            errorMessage += ` Detalhes: ${error.message}`;
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
