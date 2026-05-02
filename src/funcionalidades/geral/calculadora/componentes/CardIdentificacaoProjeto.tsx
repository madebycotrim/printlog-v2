import { FolderKanban, ChevronDown, Check, Plus, BrainCircuit } from "lucide-react";

/**
 * Interface para as propriedades do CardIdentificacaoProjeto.
 */
interface PropriedadesCardIdentificacaoProjeto {
  buscaCliente: string;
  setBuscaCliente: (v: string) => void;
  abertoSeletorCliente: boolean;
  setAbertoSeletorCliente: (v: boolean) => void;
  clientes: any[];
  clienteId: string;
  setClienteId: (v: string) => void;
  criandoNovoCliente: boolean;
  aoCriarNovoCliente: (nome: string) => Promise<void>;
  nomeProjeto: string;
  setNomeProjeto: (v: string) => void;
  descricaoProjeto: string;
  setDescricaoProjeto: (v: string) => void;
  modoEntrada: 'unitario' | 'lote';
  setModoEntrada: (v: 'unitario' | 'lote') => void;
  quantidade: number;
}

/**
 * Card de identificação do projeto, cliente e detalhes técnicos.
 */
export function CardIdentificacaoProjeto({
  buscaCliente,
  setBuscaCliente,
  abertoSeletorCliente,
  setAbertoSeletorCliente,
  clientes,
  clienteId,
  setClienteId,
  criandoNovoCliente,
  aoCriarNovoCliente,
  nomeProjeto,
  setNomeProjeto,
  descricaoProjeto,
  setDescricaoProjeto,
  modoEntrada,
  setModoEntrada,
  quantidade
}: PropriedadesCardIdentificacaoProjeto) {
  return (
    <div className={`p-6 rounded-3xl bg-[#121214] border border-white/5 relative flex flex-col gap-6 shadow-2xl backdrop-blur-3xl group transition-all duration-500 overflow-hidden ${abertoSeletorCliente ? 'z-50' : 'z-10'}`}>
      {/* Efeito Glow Azul de Fundo */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none transition-all duration-700" />

      <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#00A3FF] border border-[#00A3FF]/30">
            <FolderKanban size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-wider text-white">Identificação do Orçamento</span>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Vincule o cliente e os detalhes técnicos</span>
          </div>
        </div>
      </div>

      <div className="relative z-20 grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-6">
        {/* Lado Esquerdo: Dados do Cliente */}
        <div className="md:col-span-4 flex flex-col gap-2 relative">
          <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">Cliente do Projeto</label>

          <div className="relative flex items-center bg-zinc-950/60 border border-white/5 focus-within:border-sky-500/40 rounded-xl shadow-inner h-12 transition-all">
            <input
              type="text"
              placeholder="Buscar ou digitar cliente..."
              value={buscaCliente}
              onChange={(e) => {
                setBuscaCliente(e.target.value);
                setAbertoSeletorCliente(true);
              }}
              onFocus={() => setAbertoSeletorCliente(true)}
              className="w-full h-full bg-transparent px-4 font-bold text-xs text-zinc-100 outline-none placeholder:text-zinc-600"
            />
            <button
              type="button"
              onClick={() => setAbertoSeletorCliente(!abertoSeletorCliente)}
              className="absolute right-3 text-zinc-500 hover:text-white"
            >
              <ChevronDown size={16} className={`transition-transform duration-300 ${abertoSeletorCliente ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {abertoSeletorCliente && (
            <>
              <div className="fixed inset-0 z-[40]" onClick={() => setAbertoSeletorCliente(false)} />
              <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-[#0c0c0e] border border-white/10 rounded-xl shadow-2xl p-2 z-[100] flex flex-col gap-1 max-h-60 overflow-y-auto backdrop-blur-2xl">
                {(() => {
                  const filtrados = (clientes || []).filter(c =>
                    c.nome.toLowerCase().includes(buscaCliente.toLowerCase())
                  );
                  const clienteExato = filtrados.some(c => c.nome.toLowerCase() === buscaCliente.trim().toLowerCase());

                  return (
                    <>
                      {filtrados.map((cli) => (
                        <button
                          key={cli.id}
                          type="button"
                          onClick={() => {
                            setClienteId(cli.id);
                            setBuscaCliente(cli.nome);
                            setAbertoSeletorCliente(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg font-bold text-xs transition-colors flex items-center justify-between ${clienteId === cli.id
                            ? 'bg-sky-500/10 text-sky-400'
                            : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                          <span>{cli.nome}</span>
                          {clienteId === cli.id && <Check size={14} />}
                        </button>
                      ))}

                      {buscaCliente.trim() !== '' && !clienteExato && (
                        <button
                          type="button"
                          disabled={criandoNovoCliente}
                          onClick={() => aoCriarNovoCliente(buscaCliente.trim())}
                          className="w-full text-left px-3 py-2.5 rounded-lg font-bold text-xs text-zinc-500 hover:text-zinc-400 hover:bg-zinc-500/10 transition-colors flex items-center gap-2 border border-dashed border-zinc-500/20"
                        >
                          <Plus size={14} />
                          {criandoNovoCliente ? 'Criando...' : `Criar "${buscaCliente}"`}
                        </button>
                      )}

                      {filtrados.length === 0 && buscaCliente.trim() === '' && (
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider text-center py-2">
                          Nenhum cliente cadastrado
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
            </>
          )}
        </div>

        {/* Lado Direito: Nome e Descrição */}
        <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">Nome do Projeto</label>
            <input
              type="text"
              placeholder="Ex: Action Figure Batman"
              value={nomeProjeto}
              onChange={(e) => setNomeProjeto(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-zinc-950/60 border border-white/5 focus:border-sky-500/40 outline-none font-bold text-xs text-white transition-all shadow-inner placeholder:text-zinc-700"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">Observações Técnicas</label>
            <input
              type="text"
              placeholder="Ex: Altura de camada 0.12mm"
              value={descricaoProjeto}
              onChange={(e) => setDescricaoProjeto(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-zinc-950/60 border border-white/5 focus:border-sky-500/40 outline-none font-bold text-xs text-white transition-all shadow-inner placeholder:text-zinc-700"
            />
          </div>
        </div>
      </div>

      {/* Seletor de Modo de Entrada Global */}
      <div className="relative z-10 pt-6 border-t border-white/5 flex flex-col gap-3">
        <div className="flex flex-col items-center sm:flex-row sm:justify-between gap-4">
          <div className="flex flex-col items-center sm:items-start">
            <span className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <BrainCircuit size={14} className="text-sky-500" /> Estratégia de Preenchimento
            </span>
          </div>

          <div className="flex bg-zinc-900 p-1 rounded-xl border border-white/5 shadow-inner">
            <button
              type="button"
              onClick={() => setModoEntrada('unitario')}
              className={`px-6 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${modoEntrada === 'unitario'
                ? 'bg-zinc-800 text-sky-400 shadow-md ring-1 ring-white/10'
                : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              Por Peça
            </button>
            <button
              type="button"
              onClick={() => setModoEntrada('lote')}
              className={`px-6 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${modoEntrada === 'lote'
                ? 'bg-zinc-800 text-amber-400 shadow-md ring-1 ring-white/10'
                : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              Mesa Completa
            </button>
          </div>
        </div>

        {/* Legenda Discreta */}
        <div className="flex items-center justify-start gap-2 px-1">
          <div className={`w-1 h-1 rounded-full ${modoEntrada === 'unitario' ? 'bg-sky-500' : 'bg-amber-500'}`} />
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
            {modoEntrada === 'unitario'
              ? `Modo Unitário: O peso e tempo serão multiplicados por ${quantidade}x.`
              : `Modo Mesa: Os valores digitados já são o total de ${quantidade} peças.`
            }
          </span>
        </div>
      </div>
    </div>
  );
}
