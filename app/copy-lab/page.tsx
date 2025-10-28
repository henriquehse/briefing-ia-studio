'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface CopyResult {
  title: string;
  content: string;
}

function CopyLabContent() {
  const searchParams = useSearchParams();
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<CopyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [briefingContext, setBriefingContext] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fromForm = searchParams?.get('from');
    if (fromForm === 'form') {
      const context = localStorage.getItem('briefingContext');
      if (context) setBriefingContext(context);
    }
  }, [searchParams]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) return;
    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      const res = await fetch('/api/gemini/upload', { method: 'POST', body: formData });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="text-orange-400 hover:text-orange-300 mb-4 inline-block">← Voltar</Link>
        <h1 className="text-4xl font-bold mb-2">Copy Lab ✨</h1>
        <p className="text-slate-400 mb-8">Análise de arquivos e geração de copy</p>
        
        <div className="bg-slate-900 rounded-xl p-6 mb-6">
          <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 border-2 border-dashed border-slate-600 rounded-lg hover:border-orange-500">
            📁 Selecionar Arquivos
          </button>
          {files.length > 0 && (
            <div className="mt-4">
              {files.map((file, i) => <div key={i} className="text-sm text-slate-400">• {file.name}</div>)}
            </div>
          )}
        </div>

        <button onClick={handleAnalyze} disabled={loading || files.length === 0} className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg font-semibold disabled:opacity-50">
          {loading ? 'Analisando...' : '🔍 Analisar'}
        </button>

        {result && (
          <div className="mt-6 bg-slate-900 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4">{result.title}</h2>
            <pre className="whitespace-pre-wrap text-slate-300">{result.content}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CopyLabPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-slate-950"><div className="text-white">Carregando...</div></div>}>
      <CopyLabContent />
    </Suspense>
  );
}