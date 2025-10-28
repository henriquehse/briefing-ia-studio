'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { copyLabSchema, type CopyLabFormData } from '@/lib/schemas';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  content: string;
}

export default function CopyLabPage() {
  const router = useRouter();
  const [generatedCopy, setGeneratedCopy] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CopyLabFormData>({
    resolver: zodResolver(copyLabSchema),
  });

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
    setError('');

    try {
      const newFiles: UploadedFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.name.match(/\.(txt|md)$/i)) {
          setError(`Arquivo "${file.name}" não é suportado. Use apenas .txt ou .md`);
          continue;
        }

        const content = await readFileAsText(file);

        newFiles.push({
          name: file.name,
          size: file.size,
          type: file.type || 'text/plain',
          content,
        });
      }

      setUploadedFiles(prev => [...prev, ...newFiles]);
      e.target.value = '';
      
    } catch (err) {
      console.error('Erro ao ler arquivos:', err);
      setError('Erro ao processar arquivos. Tente novamente.');
    } finally {
      setUploadingFiles(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
  };

  const consolidateDocumentation = (): string => {
    if (uploadedFiles.length === 0) return '';

    return uploadedFiles
      .map((file, index) => {
        return `### Documento ${index + 1}: ${file.name}\n\n${file.content}\n\n---\n`;
      })
      .join('\n');
  };

  const onSubmit = async (data: CopyLabFormData) => {
    setLoading(true);
    setError('');
    setGeneratedCopy('');

    try {
      const documentationContent = consolidateDocumentation();

      const response = await fetch('/api/generate-copy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          documentationContent,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao gerar copy');
      }

      setGeneratedCopy(result.copy);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar sua solicitação');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedCopy) return;

    const blob = new Blob([generatedCopy], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `copy-suprema-${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleNewCopy = () => {
    setGeneratedCopy('');
    setError('');
    reset();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 overflow-x-hidden">
      {/* Formas decorativas - responsivas */}
      <div className="absolute top-0 left-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-[500px] lg:h-[500px] bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-[500px] lg:h-[500px] bg-blue-600/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />

      {/* Header - mobile first */}
      <header className="relative z-10 border-b border-slate-700/50 backdrop-blur-xl bg-slate-900/30">
        <div className="w-full px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1.5 sm:gap-2 text-slate-400 hover:text-slate-200 transition-colors duration-300 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium hidden sm:inline">Voltar ao Dashboard</span>
              <span className="font-medium sm:hidden">Voltar</span>
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-violet-500 rounded-full animate-pulse" />
              <span className="text-xs sm:text-sm text-slate-400">Copy Lab IA</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - mobile first */}
      <main className="relative z-10 w-full px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Hero Section - responsivo */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12 space-y-2 sm:space-y-3 lg:space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-violet-500/20 backdrop-blur-sm rounded-xl sm:rounded-2xl mb-2 sm:mb-3 lg:mb-4">
            <span className="text-2xl sm:text-3xl lg:text-4xl">✨</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-100 px-2">
            Copy Lab Supremo
          </h1>
          <p className="text-slate-400 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4">
            Crie copy profissional com blend inteligente de múltiplas documentações
          </p>
        </div>

        {!generatedCopy ? (
          // Formulário - 100% responsivo
          <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {/* Card de Upload - mobile optimized */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-700/50 p-4 sm:p-6 transition-all duration-500 hover:bg-slate-900/70 hover:border-slate-600/60">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-200">Documentação</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Arquivos .txt ou .md</p>
                  </div>
                </div>
                {uploadedFiles.length > 0 && (
                  <button
                    onClick={clearAllFiles}
                    className="px-3 py-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 hover:text-red-300 transition-all duration-300 self-start sm:self-auto"
                  >
                    Limpar Todos
                  </button>
                )}
              </div>

              {/* Input de Upload - touch friendly */}
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept=".txt,.md"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadingFiles}
                />
                <div className="border-2 border-dashed border-slate-600/50 hover:border-violet-500/50 rounded-lg p-4 sm:p-6 lg:p-8 text-center transition-all duration-300 hover:bg-slate-800/30 active:bg-slate-800/40">
                  {uploadingFiles ? (
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm sm:text-base text-slate-400">Processando...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-slate-600 mx-auto mb-2 sm:mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm sm:text-base text-slate-400 mb-1 px-2">
                        <span className="font-semibold text-violet-400">Toque para selecionar</span> arquivos
                      </p>
                      <p className="text-xs text-slate-600 px-2">.txt, .md • Múltiplos</p>
                    </>
                  )}
                </div>
              </label>

              {/* Lista de Arquivos - scroll otimizado */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs sm:text-sm font-semibold text-slate-400 mb-2 sm:mb-3">
                    {uploadedFiles.length} arquivo(s)
                  </p>
                  <div className="max-h-48 sm:max-h-64 overflow-y-auto space-y-2 pr-1">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between gap-2 p-2.5 sm:p-3 bg-slate-800/40 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-violet-500/20 rounded flex items-center justify-center flex-shrink-0">
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-slate-300 truncate">{file.name}</p>
                            <p className="text-xs text-slate-600">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="ml-2 p-1.5 hover:bg-red-500/20 rounded transition-colors duration-300 flex-shrink-0 active:bg-red-500/30"
                          title="Remover"
                        >
                          <svg className="w-4 h-4 text-slate-500 hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Card de Formulário - mobile optimized */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-700/50 p-4 sm:p-6 lg:p-8 transition-all duration-500 hover:bg-slate-900/70 hover:border-slate-600/60">
              {error && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/15 border border-red-500/30 rounded-lg text-red-300 text-xs sm:text-sm backdrop-blur-sm flex items-start gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                {/* Campo: Informações - mobile optimized */}
                <div>
                  <label htmlFor="userInfo" className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                    📋 Informações sobre a Copy
                  </label>
                  <p className="text-xs text-slate-500 mb-2 sm:mb-3">
                    Contexto, público-alvo, objetivo, tom desejado
                  </p>
                  <textarea
                    id="userInfo"
                    {...register('userInfo')}
                    rows={5}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-800/60 border border-slate-600/50 rounded-lg text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400/50 transition-all duration-300 hover:bg-slate-800/80 hover:border-slate-500/60 resize-none"
                    placeholder="Ex: Copy para landing page de curso online..."
                  />
                  {errors.userInfo && (
                    <p className="mt-1.5 sm:mt-2 text-xs text-red-400 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.userInfo.message}
                    </p>
                  )}
                </div>

                {/* Campo: Diretiva - mobile optimized */}
                <div>
                  <label htmlFor="agentDirective" className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                    🎯 Diretiva do Agente
                  </label>
                  <p className="text-xs text-slate-500 mb-2 sm:mb-3">
                    Como o agente IA deve estruturar a copy
                  </p>
                  <textarea
                    id="agentDirective"
                    {...register('agentDirective')}
                    rows={4}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-800/60 border border-slate-600/50 rounded-lg text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400/50 transition-all duration-300 hover:bg-slate-800/80 hover:border-slate-500/60 resize-none"
                    placeholder="Ex: Copywriter especialista, headlines impactantes..."
                  />
                  {errors.agentDirective && (
                    <p className="mt-1.5 sm:mt-2 text-xs text-red-400 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.agentDirective.message}
                    </p>
                  )}
                </div>

                {/* Info Blend - mobile optimized */}
                {uploadedFiles.length > 0 && (
                  <div className="p-3 sm:p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-violet-300 mb-1">
                          Blend Inteligente Ativado
                        </p>
                        <p className="text-xs text-slate-400">
                          IA irá sintetizar {uploadedFiles.length} documento(s)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botão Submit - touch friendly */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 sm:py-3.5 lg:py-4 bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm sm:text-base font-semibold rounded-lg transition-all duration-300 hover:from-violet-500 hover:to-purple-400 hover:shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2 sm:gap-3">
                      <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-xs sm:text-sm lg:text-base">Gerando copy...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Gerar Copy Suprema
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          // Resultado - mobile optimized
          <div className="w-full max-w-5xl mx-auto space-y-4 sm:space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-700/50 p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-100">Copy Suprema!</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      {uploadedFiles.length > 0 
                        ? `${uploadedFiles.length} documento(s)` 
                        : 'Pronta para uso'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview - scroll otimizado mobile */}
              <div className="bg-slate-950/50 rounded-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 max-h-80 sm:max-h-96 lg:max-h-[500px] overflow-y-auto border border-slate-700/30">
                <pre className="text-slate-300 text-xs sm:text-sm font-mono whitespace-pre-wrap break-words">
                  {generatedCopy}
                </pre>
              </div>

              {/* Botões - stack mobile, row desktop */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 sm:py-3.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-sm sm:text-base font-semibold rounded-lg transition-all duration-300 hover:from-green-500 hover:to-emerald-400 hover:shadow-[0_4px_20px_rgba(34,197,94,0.3)] hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Baixar (.txt)
                  </span>
                </button>

                <button
                  onClick={handleNewCopy}
                  className="flex-1 py-3 sm:py-3.5 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 hover:border-slate-600/60 text-slate-300 hover:text-slate-100 text-sm sm:text-base font-semibold rounded-lg transition-all duration-300 hover:shadow-[0_4px_20px_rgba(100,116,139,0.2)] focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nova Copy
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
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
