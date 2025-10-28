'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ReferenceFile {
  name: string;
  size: number;
  content: string;
}

export default function FormPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Vou te ajudar a criar um briefing completo. Para começar, me conte sobre o projeto que você tem em mente. Qual é o objetivo principal?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [references, setReferences] = useState<ReferenceFile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [generatingBriefing, setGeneratingBriefing] = useState(false);
  const [finalBriefing, setFinalBriefing] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputMessage]);

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);

    try {
      const newFiles: ReferenceFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.name.match(/\.(txt|md)$/i)) {
          continue;
        }

        const content = await readFileAsText(file);
        newFiles.push({
          name: file.name,
          size: file.size,
          content,
        });
      }

      setReferences(prev => [...prev, ...newFiles]);
      e.target.value = '';
      
      // Notificar assistente
      if (newFiles.length > 0) {
        const refMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✅ Recebi ${newFiles.length} arquivo(s) de referência: ${newFiles.map(f => f.name).join(', ')}. Vou considerar essas informações em nossa conversa!`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, refMessage]);
      }
      
    } catch (err) {
      console.error('Erro ao processar arquivos:', err);
    } finally {
      setUploadingFiles(false);
    }
  };

  const removeReference = (index: number) => {
    setReferences(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          references: references.map(r => ({
            name: r.name,
            content: r.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      const assistantId = Date.now().toString();

      // Adicionar mensagem vazia do assistente
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }]);

      // Ler stream
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                assistantMessage += parsed.text;
                
                // Atualizar mensagem em tempo real
                setMessages(prev => prev.map(m => 
                  m.id === assistantId 
                    ? { ...m, content: assistantMessage }
                    : m
                ));
              }
            } catch (e) {
              // Ignorar erros de parsing
            }
          }
        }
      }

    } catch (error) {
      console.error('Erro:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '❌ Desculpe, ocorreu um erro. Tente novamente.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBriefing = async () => {
    setGeneratingBriefing(true);

    try {
      const response = await fetch('/api/generate-briefing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          references: references.map(r => ({
            name: r.name,
            content: r.content,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao gerar briefing');
      }

      setFinalBriefing(result.briefing);

    } catch (error: any) {
      console.error('Erro:', error);
      alert('Erro ao gerar briefing: ' + error.message);
    } finally {
      setGeneratingBriefing(false);
    }
  };

  const handleDownloadBriefing = () => {
    if (!finalBriefing) return;

    const blob = new Blob([finalBriefing], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `briefing-${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (finalBriefing) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 overflow-x-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-[500px] lg:h-[500px] bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-[500px] lg:h-[500px] bg-violet-600/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />

        <header className="relative z-10 border-b border-slate-700/50 backdrop-blur-xl bg-slate-900/30">
          <div className="w-full px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-1.5 sm:gap-2 text-slate-400 hover:text-slate-200 transition-colors duration-300 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-medium">Dashboard</span>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs sm:text-sm text-slate-400">Briefing Gerado</span>
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 w-full px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-700/50 p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-100">Briefing Completo</h2>
                    <p className="text-xs sm:text-sm text-slate-500">Pronto para download e uso</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/50 rounded-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 max-h-80 sm:max-h-96 lg:max-h-[500px] overflow-y-auto border border-slate-700/30">
                <pre className="text-slate-300 text-xs sm:text-sm font-mono whitespace-pre-wrap break-words">
                  {finalBriefing}
                </pre>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={handleDownloadBriefing}
                  className="flex-1 py-3 sm:py-3.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-sm sm:text-base font-semibold rounded-lg transition-all duration-300 hover:from-green-500 hover:to-emerald-400 hover:shadow-[0_4px_20px_rgba(34,197,94,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Baixar Briefing (.txt)
                  </span>
                </button>

                <button
                  onClick={() => {
                    setFinalBriefing('');
                    setMessages([{
                      id: '1',
                      role: 'assistant',
                      content: 'Pronto para criar um novo briefing! Qual é o próximo projeto?',
                      timestamp: new Date(),
                    }]);
                    setReferences([]);
                  }}
                  className="flex-1 py-3 sm:py-3.5 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-slate-300 hover:text-slate-100 text-sm sm:text-base font-semibold rounded-lg transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Novo Briefing
                  </span>
                </button>
              </div>
            </div>
          </div>
        </main>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.6; }
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 overflow-x-hidden flex flex-col">
      {/* Backgrounds */}
      <div className="absolute top-0 left-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-[500px] lg:h-[500px] bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-[500px] lg:h-[500px] bg-orange-600/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-700/50 backdrop-blur-xl bg-slate-900/30 flex-shrink-0">
        <div className="w-full px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1.5 sm:gap-2 text-slate-400 hover:text-slate-200 transition-colors duration-300 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Voltar</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-xs sm:text-sm text-slate-400">Formulário IA</span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                      : 'bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 text-slate-200'
                  }`}
                >
                  <p className="text-sm sm:text-base whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* References Section */}
        {references.length > 0 && (
          <div className="border-t border-slate-700/50 backdrop-blur-xl bg-slate-900/30 px-3 sm:px-4 lg:px-8 py-3">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-xs text-slate-500">Referências ({references.length})</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {references.map((ref, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-slate-800/40 border border-slate-700/30 rounded-lg text-xs"
                  >
                    <span className="text-slate-300">{ref.name}</span>
                    <button
                      onClick={() => removeReference(index)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="border-t border-slate-700/50 backdrop-blur-xl bg-slate-900/30 px-3 sm:px-4 lg:px-8 py-3 sm:py-4 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-2">
              {/* Upload Button */}
              <label className="flex-shrink-0 cursor-pointer">
                <input
                  type="file"
                  accept=".txt,.md"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadingFiles}
                />
                <div className="w-10 h-10 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 rounded-lg flex items-center justify-center transition-all duration-300">
                  {uploadingFiles ? (
                    <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  )}
                </div>
              </label>

              {/* Textarea */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua mensagem... (Shift+Enter para nova linha)"
                  disabled={isLoading}
                  rows={1}
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-400/50 transition-all duration-300 resize-none max-h-32 overflow-y-auto disabled:opacity-50"
                />
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>

            {/* Generate Briefing Button */}
            {messages.length > 3 && (
              <div className="mt-3">
                <button
                  onClick={handleGenerateBriefing}
                  disabled={generatingBriefing}
                  className="w-full py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all duration-300 hover:shadow-[0_4px_20px_rgba(34,197,94,0.3)]"
                >
                  {generatingBriefing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Gerando Briefing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Gerar Briefing Final
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.6; }
          }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
