import { HelpCircle, ExternalLink, MessageCircle } from "lucide-react";

export function CartaoSuporte() {
  return (
    <div className="bg-white dark:bg-[#0e0e11] border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Suporte Maker
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">
            Central de Ajuda
          </p>
        </div>
        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
          <HelpCircle size={16} />
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          DÃºvidas sobre o sistema ou encontrou algum problema?
        </p>

        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-500/10 transition-colors uppercase tracking-wide">
            <MessageCircle size={14} />
            Abrir Chamado
          </button>
          <button className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <ExternalLink size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
