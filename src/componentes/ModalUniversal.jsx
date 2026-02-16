import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Info } from 'lucide-react';

export default function ModalUniversal({
    aberto = true,
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

    return createPortal(
        <div
            className="fixed inset-0 bg-slate-900/70 z-[9999] flex items-center justify-center p-4 backdrop-blur-md"
            onClick={(e) => {
                if (e.target === e.currentTarget) aoFechar();
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-titulo"
        >
            <div className={`
                bg-white rounded-2xl shadow-2xl w-full ${larguras[tamanho] || larguras.md} 
                flex flex-col max-h-[90vh] border border-slate-200 ring-1 ring-black/5 overflow-hidden
            `}>
                {/* Header Universal - Sticky */}
                <div className={`
                    shrink-0 p-5 flex items-start gap-4 border-b border-slate-100 
                    ${tema.bg} bg-opacity-40
                `}>
                    <div className={`
                        p-2.5 rounded-xl bg-white shadow-sm ring-1 ring-slate-100 shrink-0 
                        ${tema.text} flex items-center justify-center
                    `}>
                        <Icone size={24} strokeWidth={2} />
                    </div>

                    <div className="flex-1 pt-0.5">
                        <h2 className="text-lg font-bold text-slate-800 leading-tight tracking-tight">
                            {titulo}
                        </h2>
                        {subtitulo && (
                            <p className="text-sm text-slate-500 mt-0.5 leading-relaxed font-medium">
                                {subtitulo}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={aoFechar}
                        className="
                            group shrink-0 p-2 rounded-xl transition-colors
                            text-slate-400 hover:text-rose-500 hover:bg-rose-50 
                            border border-transparent hover:border-rose-100
                        "
                        title="Fechar (ESC)"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Conteúdo Scrollável */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar scroll-smooth">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}

