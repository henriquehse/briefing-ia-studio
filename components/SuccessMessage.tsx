interface SuccessMessageProps {
    title?: string;
    message?: string;
}

export default function SuccessMessage({
    title = 'Sucesso!',
    message = 'Operação concluída com sucesso.'
}: SuccessMessageProps) {
    return (
        <div className="glass-card p-12 rounded-3xl text-center max-w-md mx-auto animate-scale-in">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-lg">
                <span className="text-white text-5xl animate-float">✓</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
                {title}
            </h2>
            <p className="text-lg text-slate-600">
                {message}
            </p>
        </div>
    );
}
