import { MoreVertical, Edit2, Trash2, Scissors, History, PackagePlus } from "lucide-react";
import { Material } from "@/funcionalidades/producao/materiais/tipos";
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [estaVisivel, definirEstaVisivel] = useState(false);

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Usa margem grande para renderizar o pesado SVG *antes* de entrar na tela,
        // mas o descarrega (unmount) se rolar pra longe, poupando a GPU.
        definirEstaVisivel(entry.isIntersecting);
      },
      { rootMargin: "250px" }
    );
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const porcentagem = Math.min(
    100,
    Math.max(0, (material.pesoRestante / material.peso) * 100),
  );

  // Cor da barra de progresso e textos
  let corProgressoTexto = "text-emerald-600 dark:text-emerald-400";

  if (porcentagem < 20) {
    corProgressoTexto = "text-rose-600 dark:text-rose-400";
  } else if (porcentagem < 50) {
    corProgressoTexto = "text-amber-600 dark:text-amber-400";
  }

  const unidade = material.tipo === "FDM" ? "g" : "ml";

  return (
    <div ref={cardRef} className="group relative flex flex-col h-full rounded-[20px] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] cursor-default bg-white dark:bg-card-fundo border border-gray-200 dark:border-white/5">
      {/* Badge Superior Esquerdo (Tipo de Material) */}
      <div className="absolute top-4 left-4 z-20">
        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-[#a1a1aa] bg-gray-50/50 dark:bg-transparent border border-gray-200 dark:border-white/5 flex items-center justify-center shadow-sm dark:shadow-none">
          {material.tipoMaterial}
        </span>
      </div>

      {/* Indicador de Quantidade Fechada (Estoque) movido um pouco para o lado */}
      {material.estoque > 0 && (
        <div className="absolute top-4 right-14 bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2 py-1 rounded-md flex items-center gap-1 z-20 border border-emerald-500/20 shadow-[0_0_8px_rgba(52,211,153,0.1)]">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-[pulse_2s_ease-in-out_infinite]" />
          +{material.estoque} Lacre
        </div>
      )}

      {/* Ícone 3D Central */}
      <div className="flex flex-col flex-1 items-center justify-center p-6 pt-14 pb-10 relative min-h-[180px]">
        <div className="relative z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-105">
          {!estaVisivel ? (
            <div
              className="w-20 h-20 rounded-full opacity-50 border-4 shadow-inner border-gray-200 dark:border-white/5"
              style={{ backgroundColor: material.cor || "#27272a" }}
            />
          ) : material.tipo === "FDM" ? (
            <Carretel
              cor={material.cor}
              tamanho={120}
              porcentagem={porcentagem}
            />
          ) : (
            <GarrafaResina
              cor={material.cor}
              tamanho={96}
              porcentagem={porcentagem}
            />
          )}
        </div>
      </div>

      {/* Menu Dropdown de Ações */}
      <div className="absolute top-4 right-3 z-30" ref={menuRef}>
        <button
          onClick={(e) => { e.stopPropagation(); definirMenuAberto(!menuAberto); }}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none text-gray-400 hover:text-gray-900 dark:text-white/20 dark:hover:text-white"
          aria-label="Opções do material"
        >
          <MoreVertical size={16} />
        </button>

        {menuAberto && (
          <div
            className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right"
            role="menu"
          >
            <button
              onClick={() => {
                aoAbater(material.id);
                definirMenuAberto(false);
              }}
              className="w-full text-left px-4 py-3 text-sm font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 flex items-center gap-2.5 transition-colors outline-none"
              role="menuitem"
            >
              <Scissors size={14} /> Registrar Uso
            </button>
            <button
              onClick={() => {
                aoHistorico(material.id);
                definirMenuAberto(false);
              }}
              className="w-full text-left px-4 py-3 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 flex items-center gap-2.5 transition-colors border-t border-gray-100 dark:border-white/5 outline-none"
              role="menuitem"
            >
              <History size={14} /> Histórico
            </button>
            <button
              onClick={() => {
                aoRepor(material.id);
                definirMenuAberto(false);
              }}
              className="w-full text-left px-4 py-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center gap-2.5 transition-colors border-t border-gray-100 dark:border-white/5 outline-none"
              role="menuitem"
            >
              <PackagePlus size={14} /> Repor Estoque
            </button>
            <button
              onClick={() => {
                aoEditar(material);
                definirMenuAberto(false);
              }}
              className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors border-t border-gray-100 dark:border-white/5 outline-none"
              role="menuitem"
            >
              <Edit2 size={14} /> Editar
            </button>
            <button
              onClick={() => {
                aoExcluir(material.id);
                definirMenuAberto(false);
              }}
              className="w-full text-left px-4 py-3 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors border-t border-gray-100 dark:border-white/5 outline-none"
              role="menuitem"
            >
              <Trash2 size={14} /> Remover
            </button>
          </div>
        )}
      </div>

      {/* Rodapé: Fabricante | Nome | Quantidade Restante */}
      <div className="px-5 py-5 flex items-end justify-between bg-transparent border-t border-gray-100 dark:border-white/5">
        <div className="flex flex-col min-w-0 pr-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-zinc-500 mb-1.5 truncate">
            {material.fabricante}
          </span>
          <h4
            className="text-2xl font-black text-gray-900 dark:text-white tracking-tight truncate leading-none"
            title={material.nome}
          >
            {material.nome}
          </h4>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <span className={`text-[25px] font-black ${corProgressoTexto} leading-none tracking-tighter`}>
            {material.pesoRestante}<span className="text-[14px] opacity-70 ml-[1px]">{unidade}</span>
          </span>
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-zinc-600 mt-2">
            Restantes
          </span>
        </div>
      </div>
    </div>
  );
}
