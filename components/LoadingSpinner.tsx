export default function LoadingSpinner({ text = 'Carregando...' }: { text?: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 p-8">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-lg text-slate-600 animate-pulse-soft">{text}</p>
        </div>
    );
}
