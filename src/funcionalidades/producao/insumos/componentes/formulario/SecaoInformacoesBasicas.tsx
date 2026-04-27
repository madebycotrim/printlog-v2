import { Box, Tag } from "lucide-react";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";
import { CATEGORIAS } from "../../constantes";

interface PropriedadesSecaoBasica {
  register: any;
  errors: any;
  categoriaAtiva: string;
  aoMudarCategoria: (cat: string) => void;
}

export function SecaoInformacoesBasicas({ register, errors, categoriaAtiva, aoMudarCategoria }: PropriedadesSecaoBasica) {
  return (
    <div className="space-y-6">
      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] border-b border-gray-100 dark:border-white/5 pb-2 text-gray-400 dark:text-zinc-500">
        INFORMAÇÕES BÁSICAS
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CampoTexto
          rotulo="Nome do Insumo"
          icone={Box}
          placeholder="Ex: Álcool Isopropílico, Fita Blue Tape..."
          erro={errors.nome?.message}
          {...register("nome", { required: "Obrigatório" })}
        />

        <CampoTexto
          rotulo="Marca / Fabricante"
          icone={Tag}
          placeholder="Ex: Prime, 3M, Sinteglos..."
          erro={errors.marca?.message}
          {...register("marca")}
        />
      </div>

      <div className="space-y-4">
        <label className="block text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest px-1">
          Categoria Logística
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
          {CATEGORIAS.map((cat) => {
            const estaSelecionado = categoriaAtiva === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => aoMudarCategoria(cat.id)}
                className={`h-10 px-4 rounded-xl flex items-center justify-center gap-2.5 text-[10px] font-black tracking-widest transition-all whitespace-nowrap border shrink-0
                  ${
                    estaSelecionado
                      ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-900 shadow-md ring-4 ring-black/5 dark:ring-white/5"
                      : "bg-transparent text-gray-500 dark:text-zinc-500 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:text-gray-700 dark:hover:text-zinc-300"
                  }`}
              >
                <cat.icone size={12} strokeWidth={3} />
                {cat.rotulo}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
