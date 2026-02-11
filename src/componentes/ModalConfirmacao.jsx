import { AlertTriangle, X, Check } from 'lucide-react';

export default function ModalConfirmacao({
    titulo = "Confirmação",
    mensagem = "Tem certeza?",
    textoConfirmar = "Confirmar",
    textoCancelar = "Cancelar",
    aoConfirmar,
    aoFechar,
    tipo = "perigo" // perigo (vermelho), aviso (amarelo), info (azul)
}) {
    const cores = {
        perigo: {
            bg: "bg-red-50",
            border: "border-red-100",
            icon: "text-red-600",
            btn: "bg-red-600 hover:bg-red-700 shadow-red-600/20"
        },
        aviso: {
            bg: "bg-amber-50",
            border: "border-amber-100",
            icon: "text-amber-600",
            btn: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20"
        },
        info: {
            bg: "bg-blue-50",
            border: "border-blue-100",
            icon: "text-blue-600",
            btn: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
        }
    };

    const tema = cores[tipo] || cores.info;

    return (
        <div
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
            onClick={(e) => {
                if (e.target === e.currentTarget) aoFechar();
            }}
        >
            <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[scaleIn_0.2s_ease-out] border ${tema.border}`}>

                {/* Header */}
                <div className={`p-6 flex items-start gap-4 ${tema.bg}`}>
                    <div className={`p-3 rounded-xl bg-white shadow-sm shrink-0`}>
                        <AlertTriangle className={`w-6 h-6 ${tema.icon}`} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 leading-tight">{titulo}</h3>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">{mensagem}</p>
                    </div>
                    <button
                        onClick={aoFechar}
                        className="text-slate-400 hover:text-slate-600 bg-white/50 hover:bg-white p-1 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-white border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={aoFechar}
                        className="px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                    >
                        {textoCancelar}
                    </button>
                    <button
                        onClick={() => {
                            aoConfirmar();
                            aoFechar();
                        }}
                        className={`px-6 py-2.5 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2 ${tema.btn}`}
                    >
                        <Check size={18} strokeWidth={3} />
                        {textoConfirmar}
                    </button>
                </div>
            </div>
        </div>
    );
}
