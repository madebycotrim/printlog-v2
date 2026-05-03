import { useState, useEffect } from "react";
import { History, Scale, UserCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Material } from "../tipos";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { ExtratoConsumo } from "./ExtratoConsumo";
import { FormularioConsumo } from "./FormularioConsumo";
import { ConteudoFormularioMaterial } from "./ConteudoFormularioMaterial";

interface PropriedadesModalHistoricoUso {
  aberto: boolean;
  aoFechar: () => void;
  material: Material | null;
  aoAbater: (quantidade: number, motivo: string) => Promise<void>;
  aoSalvarCadastro: (dados: any) => Promise<void>;
  abaInicial?: "extrato" | "novo" | "cadastro";
}

export function ModalHistoricoUso({
  aberto,
  aoFechar,
  material,
  aoAbater,
  aoSalvarCadastro,
  abaInicial = "extrato"
}: PropriedadesModalHistoricoUso) {
  const [abaAtiva, setAbaAtiva] = useState<"extrato" | "novo" | "cadastro">(abaInicial);
  const [corTemporaria, setCorTemporaria] = useState<string | null>(null);

  useEffect(() => {
    if (aberto) {
      setAbaAtiva(abaInicial);
      setCorTemporaria(null);
    }
  }, [aberto, abaInicial]);

  if (!material) return null;

  const corExibicao = corTemporaria || material.cor || "#6366f1";

  const abas = [
    { id: "extrato", rotulo: "Extrato", icone: History },
    { id: "novo", rotulo: "Abatimento", icone: Scale },
    { id: "cadastro", rotulo: "Cadastro", icone: UserCircle },
  ];

  return (
    <Dialogo aberto={aberto} aoFechar={aoFechar} larguraMax="max-w-3xl" esconderCabecalho={true}>
      <div className="bg-white dark:bg-[#121214] min-h-[600px] flex flex-col overflow-hidden rounded-2xl shadow-2xl">
        
        {/* Cabeçalho Premium "Aura" Compacto */}
        <div className="relative px-8 py-6 flex items-center justify-between border-b border-zinc-100 dark:border-white/5 overflow-hidden">
          {/* Brilho de fundo (Aura) */}
          <div 
            className="absolute -left-20 -top-20 w-64 h-64 blur-[100px] opacity-20 pointer-events-none transition-colors duration-1000"
            style={{ backgroundColor: corExibicao }}
          />
          
          <div className="relative z-10 flex items-center gap-4">
            {/* Ponto de Status Vibrante */}
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full animate-pulse opacity-50" style={{ backgroundColor: corExibicao }} />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.2)]" style={{ backgroundColor: corExibicao }} />
            </div>
            
            <div className="flex flex-col">
              <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-none">
                {material.nome}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                  {material.tipoMaterial}
                </span>
                <span className="w-0.5 h-0.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                  {material.fabricante}
                </span>
              </div>
            </div>
          </div>

          <button onClick={aoFechar} className="relative z-10 p-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all active:scale-90">
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        {/* Sistema de Abas Contextual Compacto */}
        <div className="flex items-center px-6 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/30 dark:bg-white/[0.005]">
          {abas.map((aba) => (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id as any)}
              className={`relative py-4 px-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                abaAtiva === aba.id ? "text-zinc-900 dark:text-white" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
              style={{ color: abaAtiva === aba.id ? corExibicao : undefined }}
            >
              <aba.icone size={13} strokeWidth={abaAtiva === aba.id ? 3 : 2} />
              {aba.rotulo}
              {abaAtiva === aba.id && (
                <motion.div 
                  layoutId="aba-ativa" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-colors duration-500" 
                  style={{ backgroundColor: corExibicao }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Conteúdo das Abas */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={abaAtiva}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {abaAtiva === "extrato" && (
                <ExtratoConsumo historico={material.historicoUso} corMaterial={corExibicao} />
              )}
              {abaAtiva === "novo" && (
                <FormularioConsumo 
                  pesoDisponivel={material.pesoRestanteGramas} 
                  tipo={material.tipo} 
                  corMaterial={corExibicao}
                  aoSalvar={async (dados) => {
                    await aoAbater(dados.quantidade, dados.motivo);
                    setAbaAtiva("extrato");
                  }} 
                  aoCancelar={aoFechar} 
                />
              )}
              {abaAtiva === "cadastro" && (
                <ConteudoFormularioMaterial 
                  material={material} 
                  corMaterial={corExibicao}
                  aoMudarCor={setCorTemporaria}
                  aoSalvar={aoSalvarCadastro} 
                  aoCancelar={aoFechar} 
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Dialogo>
  );
}
