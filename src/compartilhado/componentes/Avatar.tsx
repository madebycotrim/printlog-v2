import { HTMLAttributes, useState, useEffect } from "react";
import { gerarIniciais, gerarCorPorNome } from "@/compartilhado/utilitarios/avatar";
import { PlanoUsuario } from "../tipos/modelos";

interface PropriedadesAvatar extends HTMLAttributes<HTMLDivElement> {
  /** Nome do usuário para gerar iniciais e cor */
  nome?: string | null;
  /** URL da foto opcional */
  fotoUrl?: string | null;
  /** Tamanho do avatar (ex: "w-9 h-9") */
  tamanho?: string;
  /** Se deve ser arredondado ou levemente arredondado */
  variante?: "circular" | "quadrado";
  /** @deprecated Use 'plano' em vez disso. Se o usuário é PRO para ativar efeitos de elite */
  pro?: boolean;
  /** Plano do usuário para efeitos visuais específicos */
  plano?: PlanoUsuario;
}

/**
 * Componente de Avatar que exibe a foto do usuário ou suas iniciais
 * com uma cor de fundo determinística baseada no nome.
 */
export function Avatar({
  nome,
  fotoUrl,
  tamanho = "h-9 w-9",
  variante = "quadrado",
  pro = false,
  plano,
  className = "",
  style,
  ...outrasPropriedades
}: PropriedadesAvatar) {
  const [imagemFalhou, definirImagemFalhou] = useState(false);
  
  // Reinicia o estado de erro se a fotoUrl mudar
  useEffect(() => {
    definirImagemFalhou(false);
  }, [fotoUrl]);

  const iniciais = gerarIniciais(nome);
  const corFundo = gerarCorPorNome(nome);
  
  // Forçamos o rounded-2xl para o visual de "quadrado arredondado" premium
  const arredondamento = variante === "circular" ? "rounded-full" : "rounded-xl";

  const mostrarIniciais = !fotoUrl || imagemFalhou;

  const efeitoElite = () => {
    const p = plano || (pro ? "PRO" : "FREE");
    if (p === "FUNDADOR") return "ring-2 ring-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.4)]";
    if (p === "PRO") return "ring-2 ring-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.4)]";
    return "";
  };

  return (
    <div
      className={`${tamanho} ${arredondamento} flex items-center justify-center text-base font-black shrink-0 relative overflow-hidden border border-black/5 dark:border-white/5 ${efeitoElite()} ${className}`}
      style={{
        backgroundColor: mostrarIniciais ? corFundo : "transparent",
        color: "white",
        ...style,
      }}
      {...outrasPropriedades}
    >
      {fotoUrl && !imagemFalhou ? (
        <img
          src={fotoUrl}
          alt={nome || "Avatar"}
          className={`h-full w-full object-cover ${arredondamento}`}
          onError={() => definirImagemFalhou(true)}
        />
      ) : (
        <span className="select-none tracking-tight">{iniciais}</span>
      )}
      
      {/* Overlay de Brilho para estética premium */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
    </div>
  );
}
