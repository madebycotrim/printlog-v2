import { MoreVertical, Edit2, Trash2, Scissors, History, PackagePlus } from "lucide-react";
import { Material } from "../tipos";
import {
  Carretel,
  GarrafaResina,
} from "@/compartilhado/componentes_ui/Icones3D";
import { useState, useRef, useEffect, useCallback } from "react";

interface CardMaterialProps {
  material: Material;
  aoEditar: (material: Material) => void;
  aoExcluir: (id: string) => void;
  aoAbater: (id: string) => void;
  aoHistorico: (id: string) => void;
  aoRepor: (id: string) => void;
}

export function CardMaterial({
  material,
  aoEditar,
  aoExcluir,
  aoAbater,
  aoHistorico,
  aoRepor,
}: CardMaterialProps) {
  const [menuAberto, definirMenuAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fechar menu ao clicar fora ou apertar ESC
  const lidarComTecla = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") definirMenuAberto(false);
  }, []);

  useEffect(() => {
    function lidarComCliqueFora(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        definirMenuAberto(false);
      }
    }

    if (menuAberto) {
      document.addEventListener("mousedown", lidarComCliqueFora);
      document.addEventListener("keydown", lidarComTecla);
    }

    return () => {
      document.removeEventListener("mousedown", lidarComCliqueFora);
      document.removeEventListener("keydown", lidarComTecla);
    };
  }, [menuAberto, lidarComTecla]);

  const porcentagem = Math.min(
    100,
    Math.max(0, (material.pesoRestante / material.peso) * 100),
  );

  // Cor da barra de progresso e textos
  let corProgressoTexto = "text-emerald-600 dark:text-emerald-400";
  let corProgressoFundo = "bg-emerald-500";

  if (porcentagem < 20) {
    corProgressoTexto = "text-rose-600 dark:text-rose-400";
    corProgressoFundo = "bg-rose-500";
  } else if (porcentagem < 50) {
    corProgressoTexto = "text-amber-600 dark:text-amber-400";
    corProgressoFundo = "bg-amber-500";
  }

  const custoPorUnidade = material.preco / material.peso;
  const unidade = material.tipo === "FDM" ? "g" : "ml";

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 rounded-3xl p-5 shadow-sm relative group hover:-translate-y-1 hover:shadow-xl hover:border-gray-300 dark:hover:border-white/10 transition-all duration-300">
      {/* Cabeçalho do Card (cone + Info) */}
      <div className="flex items-start gap-4 mb-3">
        {/* cone 3D em miniatura - Aumentado e destacado */}
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#18181b] dark:to-[#121214] border border-gray-200/50 dark:border-white/5 flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden group-hover:shadow-md transition-shadow duration-300">
          {/* Brilho sutil no fundo usando a cor do material */}
          <div
            className="absolute inset-0 opacity-20 dark:opacity-10 blur-xl transition-opacity duration-300 group-hover:opacity-30 dark:group-hover:opacity-20"
            style={{ backgroundColor: material.cor }}
          />
          <div className="relative z-10 drop-shadow-md transition-transform duration-500 group-hover:scale-110">
            {material.tipo === "FDM" ? (
              <Carretel
                cor={material.cor}
                tamanho={72}
                porcentagem={porcentagem}
              />
            ) : (
              <GarrafaResina
                cor={material.cor}
                tamanho={64}
                porcentagem={porcentagem}
              />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0 pr-6 flex flex-col justify-between h-24 py-1">
          <div>
            <h4
              className="text-lg font-black text-gray-900 dark:text-white truncate"
              title={material.nome}
            >
              {material.nome}
            </h4>
            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 truncate mt-0.5">
              {material.fabricante} • {material.tipoMaterial}
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 shadow-sm w-fit max-w-full">
            <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider shrink-0">
              Custo
            </span>
            <div className="flex items-baseline gap-1 min-w-0">
              <span className="text-xs font-black text-gray-900 dark:text-white whitespace-nowrap">
                R$ {custoPorUnidade.toFixed(3).replace(".", ",")}
              </span>
              <span className="text-gray-400 dark:text-zinc-500 font-medium text-xs whitespace-nowrap">
                /{unidade}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Progresso do Rolo/Garrafa */}
      <div className="space-y-2 mt-auto">
        <div className="flex justify-between items-end text-sm">
          <span className="text-gray-500 dark:text-zinc-400 font-semibold text-xs">
            Quantidade Restante
          </span>
          <div className="flex items-baseline gap-1">
            <span className={`font-black ${corProgressoTexto} text-base`}>
              {material.pesoRestante}
              {unidade}
            </span>
            <span className="text-gray-400 dark:text-zinc-500 font-medium text-xs">
              / {material.peso}
              {unidade}
            </span>
          </div>
        </div>
        <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full ${corProgressoFundo} transition-all duration-700 ease-out`}
            style={{ width: `${porcentagem}%` }}
          />
        </div>
      </div>

      {/* Menu Dropdown de Ações */}
      <div className="absolute top-4 right-4 z-20" ref={menuRef}>
        <button
          onClick={() => definirMenuAberto(!menuAberto)}
          aria-label="Opções do material"
          aria-expanded={menuAberto}
          aria-haspopup="menu"
          className="p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          <MoreVertical size={18} />
        </button>

        {menuAberto && (
          <div
            className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right"
            role="menu"
          >
            <button
              onClick={() => {
                aoAbater(material.id);
                definirMenuAberto(false);
              }}
              className="w-full text-left px-4 py-3 text-sm font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 flex items-center gap-2.5 transition-colors focus:bg-sky-50 focus:dark:bg-sky-500/10 outline-none"
              role="menuitem"
            >
              <Scissors size={16} /> Registrar Uso
            </button>
            <button
              onClick={() => {
                aoHistorico(material.id);
                definirMenuAberto(false);
              }}
              className="w-full text-left px-4 py-3 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 flex items-center gap-2.5 transition-colors border-t border-gray-100 dark:border-white/5 focus:bg-indigo-50 focus:dark:bg-indigo-500/10 outline-none"
              role="menuitem"
            >
              <History size={16} /> Histórico
            </button>
            <button
              onClick={() => {
                aoEditar(material);
                definirMenuAberto(false);
              }}
              className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors border-t border-gray-100 dark:border-white/5 focus:bg-gray-50 focus:dark:bg-white/5 outline-none"
              role="menuitem"
            >
              <Edit2 size={16} /> Editar
            </button>
            <button
              onClick={() => {
                aoRepor(material.id);
                definirMenuAberto(false);
              }}
              className="w-full text-left px-4 py-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center gap-2.5 transition-colors border-t border-gray-100 dark:border-white/5 focus:bg-emerald-50 focus:dark:bg-emerald-500/10 outline-none"
              role="menuitem"
            >
              <PackagePlus size={16} /> Repor Estoque
            </button>
            <button
              onClick={() => {
                aoExcluir(material.id);
                definirMenuAberto(false);
              }}
              className="w-full text-left px-4 py-3 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors border-t border-gray-100 dark:border-white/5 focus:bg-rose-50 focus:dark:bg-rose-500/10 outline-none"
              role="menuitem"
            >
              <Trash2 size={16} /> Remover
            </button>
          </div>
        )}
      </div>

      {/* Indicador de Quantidade Fechada (Estoque) */}
      {material.estoque > 0 && (
        <div className="absolute -top-3 -left-3 bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-md text-gray-900 dark:text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-sm border border-gray-200/80 dark:border-white/10 flex items-center gap-1.5 z-10 transition-transform group-hover:scale-105">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]" />
          +{material.estoque} Lacrados
        </div>
      )}
    </div>
  );
}
