import React, { useEffect } from 'react';
import { X, Info } from 'lucide-react';

export default function ModalUniversal({
    aberto,
    aoFechar,
    titulo,
    subtitulo,
    icone: Icone = Info,
    children,
    tamanho = 'md',
    cor = 'indigo' // indigo, red, blue, emerald, amber, rose, violet
}) {
    if (!aberto) return null;

    const larguras = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        auto: 'w-auto max-w-[95vw]' // Adaptável ao conteúdo
    };

    const cores = {
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
        red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
        rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
        violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
        slate: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' }
    };

    const tema = cores[cor] || cores.indigo;

    // Fechar com ESC e Bloquear Scroll
    useEffect(() => {
        if (aberto) {
            // Bloquear scroll
            document.body.style.overflow = 'hidden';

            // Listener para ESC
            const handleEsc = (e) => {
                if (e.key === 'Escape') aoFechar();
            };
            window.addEventListener('keydown', handleEsc);

            return () => {
                document.body.style.overflow = 'unset';
                window.removeEventListener('keydown', handleEsc);
            };
        }
    }, [aberto, aoFechar]);

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity animate-[fadeIn_0.2s_ease-out]"
            onClick={(e) => {
                if (e.target === e.currentTarget) aoFechar();
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-titulo"
        >
            <div className={`bg-white rounded-2xl shadow-2xl w-full ${larguras[tamanho] || larguras.md} overflow-hidden animate-[scaleIn_0.2s_ease-out] flex flex-col max-h-[90vh]`}>
                {/* Header Universal */}
                <div className={`p-6 flex items-start gap-4 border-b ${tema.bg} ${tema.border}`}>
                    <div className="p-3 rounded-xl bg-white shadow-sm shrink-0">
                        <Icone className={`w-6 h-6 ${tema.text}`} />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-slate-800 leading-tight">
                            {titulo}
                        </h2>
                        {subtitulo && (
                            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                {subtitulo}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={aoFechar}
                        className="text-slate-400 hover:text-slate-600 bg-white/50 hover:bg-white p-1 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Conteúdo flexível (pode ser scrollável ou não dependendo do filho) */}
                {children}
            </div>
        </div>
    );
}
