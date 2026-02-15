import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../servicos/api';
import { Wifi, WifiOff, Search, X, Check, AlertTriangle, User, Palette, Lock, Unlock, Zap } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { bancoLocal } from '../servicos/bancoLocal';
import { tocarBeep } from '../utilitarios/audio';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { obterCorDoDia } from '../utilitarios/validacaoVisual';
import { validarQRSeguro } from '../utilitarios/seguranca';
import { obterDataCorrigida } from '../utilitarios/relogio';
import { useAutenticacao } from '../contexts/ContextoAutenticacao';

// v3.0 - TTS (Text-to-Speech)
const anunciarNome = (nome) => {
    if (!('speechSynthesis' in window)) return;

    // Cancelar falas anteriores
    window.speechSynthesis.cancel();

    // Criar nova fala
    const mensagem = new SpeechSynthesisUtterance(nome.toLowerCase());
    mensagem.lang = 'pt-BR';
    mensagem.rate = 1.1;
    mensagem.pitch = 1.0;

    // Tentar encontrar voz em português
    const vozes = window.speechSynthesis.getVoices();
    const vozPT = vozes.find(v => v.lang.includes('PT') || v.lang.includes('br'));
    if (vozPT) mensagem.voice = vozPT;

    window.speechSynthesis.speak(mensagem);
};

// Hook de status online simplificado
function useStatusConexao() {
    const [estaOnline, definirEstaOnline] = useState(navigator.onLine);

    useEffect(() => {
        const aoMudarStatus = () => definirEstaOnline(navigator.onLine);
        window.addEventListener('online', aoMudarStatus);
        window.addEventListener('offline', aoMudarStatus);

        return () => {
            window.removeEventListener('online', aoMudarStatus);
            window.removeEventListener('offline', aoMudarStatus);
        };
    }, []);

    return estaOnline;
}

export default function LeitorPortaria() {
    const { usuarioAtual } = useAutenticacao();
    const [ultimoResultado, definirUltimoResultado] = useState(null);
    const [scannerAtivo, definirScannerAtivo] = useState(true);
    const refScanner = useRef(null);
    const estaOnline = useStatusConexao();
    const [modoManual, definirModoManual] = useState(false);
    const [matriculaManual, definirMatriculaManual] = useState('');
    const [processando, definirProcessando] = useState(false);

    // Busca por nome
    const [modoBuscaNome, definirModoBuscaNome] = useState(false);
    const [termoBusca, definirTermoBusca] = useState('');
    const [sugestoesAlunos, definirSugestoesAlunos] = useState([]);
    const [alunoSelecionado, definirAlunoSelecionado] = useState(null);

    // Refs para evitar closures (scanner roda em callback desconectado do ciclo de render)
    const refScannerAtivo = useRef(scannerAtivo);
    const refProcessando = useRef(processando);

    useEffect(() => {
        refScannerAtivo.current = scannerAtivo;
    }, [scannerAtivo]);

    useEffect(() => {
        refProcessando.current = processando;
    }, [processando]);

    // v2.5 - Validação Visual
    const [corDoDia, definirCorDoDia] = useState(null);

    useEffect(() => {
        definirCorDoDia(obterCorDoDia());
    }, []);

    const resetarScannerEm = useCallback((ms) => {
        setTimeout(() => {
            definirUltimoResultado(null);
            definirScannerAtivo(true);
            if (modoManual) {
                definirMatriculaManual('');
                definirTermoBusca('');
                definirSugestoesAlunos([]);
                definirAlunoSelecionado(null);
            }
        }, ms);
    }, [modoManual]);

    // Buscar alunos por nome com debounce
    useEffect(() => {
        if (!modoBuscaNome || !termoBusca.trim()) {
            definirSugestoesAlunos([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            try {
                const resultados = await bancoLocal.buscarAlunosPorNome(termoBusca);
                definirSugestoesAlunos(resultados);
            } catch (erro) {
                console.error('Erro ao buscar alunos:', erro);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [termoBusca, modoBuscaNome]);

    const processarEntrada = useCallback(async (codigoEntrada, eManual = false) => {
        if (!refScannerAtivo.current || refProcessando.current) return;
        definirScannerAtivo(false);
        definirProcessando(true);

        try {
            let matriculaFinal = codigoEntrada;
            let autentico = false;

            // Tentar validar como JWT (Token Seguro)
            if (codigoEntrada.length > 20 && codigoEntrada.includes('.')) {
                try {
                    const resultadoValidacao = await validarQRSeguro(codigoEntrada);
                    if (resultadoValidacao.valido) {
                        matriculaFinal = resultadoValidacao.matricula;
                        autentico = true;
                    } else {
                        tocarBeep('erro');
                        definirUltimoResultado({
                            status: 'erro',
                            mensagem: 'QR CODE FALSIFICADO OU EXPIRADO',
                            motivo: 'Assinatura Inválida'
                        });
                        resetarScannerEm(4000);
                        return;
                    }
                } catch (e) {
                    console.warn("Falha ao validar token:", e);
                }
            } else {
                autentico = false;
            }

            // 1. Validação Local
            const aluno = await bancoLocal.buscarAluno(matriculaFinal);

            if (!aluno) {
                tocarBeep('erro');
                definirUltimoResultado({ status: 'erro', mensagem: 'ALUNO NÃO ENCONTRADO', matriculaAlvo: matriculaFinal });
                resetarScannerEm(3000);
                return;
            }

            // 2. Anti-duplicação (3 minutos)
            const todosRegistros = await bancoLocal.listarRegistrosPendentes();
            const duplicado = todosRegistros.find(r =>
                r.aluno_matricula === matriculaFinal &&
                (Date.now() - new Date(r.timestamp).getTime()) < 3 * 60 * 1000
            );

            if (duplicado) {
                tocarBeep('duplicado');
                const horarioAntigo = format(new Date(duplicado.timestamp), 'HH:mm');
                definirUltimoResultado({
                    status: 'duplicado',
                    mensagem: `REGISTRO DUPLICADO (${horarioAntigo})`,
                    aluno,
                    autentico: autentico
                });
                resetarScannerEm(3000);
                return;
            }

            // Define saudação para TTS
            const horaAtual = new Date().getHours();
            const saudacao = horaAtual < 12 ? 'Bom dia, ' : horaAtual < 18 ? 'Boa tarde, ' : 'Boa noite, ';

            // 3. Registrar Acesso
            const hoje = format(obterDataCorrigida(), 'yyyy-MM-dd');
            const registrosHoje = todosRegistros.filter(r =>
                r.aluno_matricula === matriculaFinal &&
                r.timestamp.startsWith(hoje)
            );

            const tipo = registrosHoje.length % 2 === 0 ? 'ENTRADA' : 'SAÍDA';

            const registro = {
                id: crypto.randomUUID(),
                aluno_matricula: matriculaFinal,
                tipo_movimentacao: tipo,
                timestamp: obterDataCorrigida().toISOString(),
                metodo_validacao: autentico ? 'HMAC' : 'LEGADO',
                // Novo campo: autorizado_por (se manual)
                autorizado_por: eManual && usuarioAtual ? usuarioAtual.email : null
            };

            await bancoLocal.salvarRegistro(registro);

            if (navigator.onLine) {
                api.enviar('/acessos', [registro]).then(() => {
                    bancoLocal.marcarComoSincronizado([registro.id]);
                }).catch(e => console.warn('Falha no envio imediato:', e));
            }

            tocarBeep('sucesso');
            anunciarNome(saudacao + aluno.nome_completo.split(' ')[0]);

            definirUltimoResultado({
                status: 'sucesso',
                mensagem: `${tipo} REGISTRADA`,
                aluno,
                autentico: autentico,
                manual: eManual
            });
            resetarScannerEm(2000);

        } catch (erro) {
            console.error(erro);
            tocarBeep('erro');
            definirUltimoResultado({ status: 'erro', mensagem: 'ERRO DO SISTEMA', matriculaAlvo: codigoEntrada });
            resetarScannerEm(3000);
        } finally {
            definirProcessando(false);
        }
    }, [resetarScannerEm, usuarioAtual]);

    useEffect(() => {
        if (modoManual) return;

        const leitorQr = new Html5Qrcode("reader");
        const configuracao = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };

        leitorQr.start(
            { facingMode: "environment" },
            configuracao,
            (textoDecodificado) => {
                processarEntrada(textoDecodificado);
            },
            () => { }
        ).catch(erro => {
            console.error("Erro ao iniciar scanner:", erro);
        });

        refScanner.current = leitorQr;

        return () => {
            if (leitorQr.isScanning) {
                leitorQr.stop().then(() => leitorQr.clear()).catch(console.warn);
            } else {
                try { leitorQr.clear(); } catch { /* ignore */ }
            }
        };
    }, [modoManual, processarEntrada]);

    const aoEnviarManual = (evento) => {
        evento.preventDefault();

        if (modoBuscaNome && alunoSelecionado) {
            // Usar aluno selecionado da busca por nome
            processarEntrada(alunoSelecionado.matricula, true);
        } else if (!modoBuscaNome && matriculaManual.trim()) {
            // Usar matrícula digitada
            processarEntrada(matriculaManual.trim(), true);
        }
    };

    const selecionarAluno = (aluno) => {
        definirAlunoSelecionado(aluno);
        definirTermoBusca(aluno.nome_completo);
        definirSugestoesAlunos([]);
    };

    return (
        <div className="relative min-h-screen bg-[#0a0a16] text-white font-sans overflow-hidden selection:bg-indigo-500/30">
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-violet-900/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
            </div>

            {/* Header */}
            <header className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-20">
                <Link to="/painel" className="group flex items-center gap-1 transition-all hover:opacity-80">
                    <span className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 drop-shadow-2xl">SCAE</span>
                    <span className="text-3xl font-black tracking-tighter text-indigo-500 drop-shadow-lg">.</span>
                </Link>

                <div className="flex gap-4 items-center">
                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border backdrop-blur-md transition-all duration-500 shadow-lg ${estaOnline
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-900/20'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-rose-900/20'
                        }`}>
                        {estaOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                        <span className="text-[10px] font-black tracking-widest uppercase">
                            {estaOnline ? 'ONLINE' : 'OFFLINE'}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
                {/* Scanner Container Premium */}
                <div className={`relative w-full max-w-sm aspect-square bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 ring-4 ring-black/50 ${corDoDia ? `ring-offset-2 ring-offset-black/50 shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)] ${corDoDia.classe.replace('border', 'ring')}` : ''}`}>
                    {!modoManual ? (
                        <>
                            <div id="reader" className="w-full h-full object-cover opacity-90 grayscale-[20%] contrast-[1.1]"></div>

                            {/* Overlay Container - Futuristic */}
                            <div className="absolute inset-0 z-10 pointer-events-none">
                                {/* Quinas Brilhantes */}
                                <div className="absolute top-8 left-8 w-10 h-10 border-t-[6px] border-l-[6px] border-white/90 rounded-tl-3xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                                <div className="absolute top-8 right-8 w-10 h-10 border-t-[6px] border-r-[6px] border-white/90 rounded-tr-3xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                                <div className="absolute bottom-8 left-8 w-10 h-10 border-b-[6px] border-l-[6px] border-white/90 rounded-bl-3xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                                <div className="absolute bottom-8 right-8 w-10 h-10 border-b-[6px] border-r-[6px] border-white/90 rounded-br-3xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>

                                {/* Varredura Laser */}
                                <div className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_20px_rgba(99,102,241,1)] animate-[varredura_2s_ease-in-out_infinite] top-1/2"></div>

                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]"></div>
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full bg-[#1a1a2e] flex flex-col items-center justify-center p-6 text-center">
                            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <Search className="w-10 h-10 text-indigo-400" />
                            </div>
                            <p className="text-indigo-200/50 text-sm font-medium tracking-wide uppercase">Modo Manual Ativo</p>
                        </div>
                    )}
                </div>

                {/* Status Text (Idle) */}
                {scannerAtivo && !modoManual && (
                    <div className="mt-10 text-center">
                        <p className="text-sm font-bold tracking-[0.2em] uppercase text-indigo-200/40 animate-pulse">Aproxime o QRCode</p>
                    </div>
                )}

                {/* Date Display */}
                <div className="mt-4 text-center opacity-40">
                    <p className="text-xs font-mono tracking-widest uppercase text-indigo-200">
                        {format(obterDataCorrigida(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </p>
                </div>

                {/* Botão Modo Manual Minimalista */}
                <div className="fixed bottom-8 right-8 z-50">
                    <button
                        onClick={() => definirModoManual(!modoManual)}
                        className="bg-white/5 hover:bg-white/10 text-white p-4 rounded-full backdrop-blur-xl transition-all active:scale-95 shadow-2xl border border-white/10 group"
                    >
                        {modoManual ? (
                            <Zap className="w-6 h-6 text-indigo-400 group-hover:text-amber-400 transition-colors" />
                        ) : (
                            <Search className="w-6 h-6 text-indigo-400 group-hover:text-white transition-colors" />
                        )}
                    </button>
                </div>
            </main>

            {/* Manual Entry Sheet */}
            {modoManual && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-30 transition-opacity animate-[fadeIn_0.2s]" onClick={() => definirModoManual(false)} />
            )}

            <div className={`fixed bottom-0 left-0 w-full bg-[#131326] rounded-t-[3rem] p-8 shadow-[0_-10px_80px_rgba(0,0,0,0.5)] transform transition-transform duration-300 z-40 border-t border-white/10 ${modoManual ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="w-full flex justify-center mb-8" onClick={() => definirModoManual(false)}>
                    <div className="w-16 h-1.5 bg-indigo-500/20 rounded-full cursor-pointer hover:bg-indigo-500/40 transition-colors"></div>
                </div>

                <form onSubmit={aoEnviarManual} className="max-w-md mx-auto">
                    {/* Toggle Modo de Busca */}
                    <div className="flex gap-2 mb-6">
                        <button
                            type="button"
                            onClick={() => {
                                definirModoBuscaNome(false);
                                definirTermoBusca('');
                                definirSugestoesAlunos([]);
                                definirAlunoSelecionado(null);
                            }}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${!modoBuscaNome
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                        >
                            🔢 Matrícula
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                definirModoBuscaNome(true);
                                definirMatriculaManual('');
                            }}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${modoBuscaNome
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                        >
                            👤 Nome
                        </button>
                    </div>

                    <div className="relative mb-6">
                        {!modoBuscaNome ? (
                            <input
                                type="text"
                                value={matriculaManual}
                                onChange={(e) => definirMatriculaManual(e.target.value)}
                                placeholder="Digite a Matrícula"
                                className="w-full bg-[#0a0a14] border border-white/5 rounded-2xl px-6 py-5 text-center text-xl text-white placeholder-indigo-500/20 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:outline-none font-mono tracking-wider transition-all shadow-inner"
                                autoFocus={modoManual}
                            />
                        ) : (
                            <>
                                <input
                                    type="text"
                                    value={termoBusca}
                                    onChange={(e) => {
                                        definirTermoBusca(e.target.value);
                                        definirAlunoSelecionado(null);
                                    }}
                                    placeholder="Digite o nome do aluno..."
                                    className="w-full bg-[#0a0a14] border border-white/5 rounded-2xl px-6 py-5 text-center text-xl text-white placeholder-indigo-500/20 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:outline-none transition-all shadow-inner"
                                    autoFocus={modoManual}
                                />

                                {/* Autocomplete Dropdown */}
                                {sugestoesAlunos.length > 0 && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-[#1a1a2e] border border-indigo-500/20 rounded-2xl overflow-hidden shadow-2xl max-h-80 overflow-y-auto z-50">
                                        {sugestoesAlunos.map((aluno) => (
                                            <button
                                                key={aluno.matricula}
                                                type="button"
                                                onClick={() => selecionarAluno(aluno)}
                                                className="w-full text-left px-6 py-4 hover:bg-indigo-500/10 transition-colors border-b border-white/5 last:border-b-0 focus:bg-indigo-500/20 focus:outline-none"
                                            >
                                                <p className="font-bold text-white">{aluno.nome_completo}</p>
                                                <div className="flex gap-4 mt-1">
                                                    <span className="text-xs text-indigo-400 font-mono">{aluno.matricula}</span>
                                                    <span className="text-xs text-indigo-400">{aluno.turma_id}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Aluno Selecionado */}
                                {alunoSelecionado && (
                                    <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                                        <p className="text-green-400 font-bold text-center">✓ {alunoSelecionado.nome_completo}</p>
                                        <p className="text-green-400/70 text-xs text-center mt-1">{alunoSelecionado.turma_id}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={modoBuscaNome ? !alunoSelecionado : !matriculaManual.trim()}
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black py-5 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirmar Entrada
                    </button>
                </form>
            </div>

            {/* Full Screen Result Overlay */}
            {ultimoResultado && (
                <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-8 transition-all duration-300 ${ultimoResultado.status === 'sucesso' ? 'bg-emerald-600' :
                    ultimoResultado.status === 'erro' ? 'bg-rose-600' :
                        'bg-amber-500'
                    }`} onClick={() => definirUltimoResultado(null)}>

                    <div className="mb-8 p-6 bg-white/20 rounded-full shadow-2xl backdrop-blur-md animate-[bounceIn_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)]">
                        {ultimoResultado.status === 'sucesso' ? <Check className="w-16 h-16 text-white drop-shadow-md" strokeWidth={3} /> :
                            ultimoResultado.status === 'erro' ? <X className="w-16 h-16 text-white drop-shadow-md" strokeWidth={3} /> :
                                <AlertTriangle className="w-16 h-16 text-white drop-shadow-md" strokeWidth={3} />}
                    </div>

                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-4 text-center drop-shadow-lg animate-[fadeIn_0.3s_ease-out_0.2s_both]">
                        {ultimoResultado.status === 'sucesso' ? 'Acesso Liberado' :
                            ultimoResultado.status === 'erro' ? 'Acesso Negado' :
                                'Atenção'}
                    </h1>

                    <p className="text-xl text-white/90 font-medium mb-12 text-center max-w-lg leading-relaxed opacity-90 animate-[fadeIn_0.3s_ease-out_0.3s_both]">
                        {ultimoResultado.mensagem}
                    </p>

                    {ultimoResultado.aluno && (
                        <div className="bg-black/20 p-8 rounded-3xl w-full max-w-sm backdrop-blur-xl text-center border border-white/20 shadow-2xl animate-[slideUp_0.4s_ease-out_0.4s_both]">
                            <h2 className="text-3xl font-bold text-white mb-2 leading-tight truncate">
                                {ultimoResultado.aluno.nome_completo.split(' ')[0]} <span className="text-white/70">{ultimoResultado.aluno.nome_completo.split(' ').pop()}</span>
                            </h2>
                            <p className="text-lg text-white/50 font-mono tracking-widest uppercase border-t border-white/10 pt-4 mt-4 inline-block px-8">
                                {ultimoResultado.aluno.turma_id}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
