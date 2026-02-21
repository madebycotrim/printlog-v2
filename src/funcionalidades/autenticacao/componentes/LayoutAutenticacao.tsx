import { ReactNode } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface PropsLayout {
  children: ReactNode;
  titulo?: string;
  linkVoltar?: string;
  textoVoltar?: string;
  larguraMaxima?: string; // 'max-w-5xl' | 'max-w-4xl' etc
}

export function LayoutAutenticacao({
  children,
  linkVoltar = "/",
  textoVoltar = "Voltar ao site",
  larguraMaxima = "max-w-5xl",
}: PropsLayout) {
  return (
    <div className="min-h-screen w-full font-sans bg-[#050505] relative flex items-center justify-center p-4 overflow-hidden selection:bg-[#0ea5e9] selection:text-white">
      {/* Efeitos de Fundo */}
      <div className="absolute inset-0 bg-[#050507] z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050507] to-[#050507]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl mx-auto pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl mix-blend-screen animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl mix-blend-screen animate-pulse delay-1000" />
        </div>
      </div>

      {/* ── Grade Animada ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right,rgba(14,165,233,.04) 1px,transparent 1px),linear-gradient(to bottom,rgba(14,165,233,.04) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
          animation: "movimentoGrade 20s linear infinite",
        }}
      />
      <style>{`
                @keyframes movimentoGrade {
                    from { background-position: 0 0; }
                    to   { background-position: 40px 40px; }
                }
            `}</style>

      {/* Link Voltar */}
      <nav className="absolute top-6 left-6 z-50">
        <a
          href={linkVoltar}
          className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium"
        >
          <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 group-hover:bg-white/10 transition-all">
            {linkVoltar === "/" ? (
              <ArrowRight size={14} className="rotate-180" />
            ) : (
              <ArrowLeft size={14} />
            )}
          </div>
          {textoVoltar}
        </a>
      </nav>

      {/* Version Badge Bottom Right */}
      <div className="absolute bottom-4 right-6 text-zinc-800 text-[10px] uppercase tracking-widest font-mono z-0 hidden lg:block">
        PrintLog v2.0 - Build 2024.1
      </div>

      {/* Card Principal */}
      <div
        className={`w-full ${larguraMaxima} min-h-[450px] bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex overflow-hidden relative z-10 animate-fade-in-up`}
      >
        {children}
      </div>
    </div>
  );
}
