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
    const [ultimoResultado, definirUltimoResultado] = useState(null);
    const [scannerAtivo, definirScannerAtivo] = useState(true);
    const refScanner = useRef(null);
    const estaOnline = useStatusConexao();
    const [modoManual, definirModoManual] = useState(false);
    const [matriculaManual, definirMatriculaManual] = useState('');
    const [processando, definirProcessando] = useState(false);

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
            }
        }, ms);
    }, [modoManual]);

    const processarEntrada = useCallback(async (codigoEntrada) => {
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
                metodo_validacao: autentico ? 'HMAC' : 'LEGADO'
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
                autentico: autentico
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
    }, [resetarScannerEm]);

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
        if (matriculaManual.trim()) {
            processarEntrada(matriculaManual.trim());
        }
    };

    return (
        <div className="relative min-h-screen bg-slate-900 text-white font-sans overflow-hidden selection:bg-blue-500/30">
            {/* Header */}
            <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
                <Link to="/painel" className="group flex items-center gap-1 transition-all hover:opacity-80">
                    <span className="text-3xl font-black tracking-tighter text-white drop-shadow-lg">SCAE</span>
                    <span className="text-3xl font-black tracking-tighter text-blue-500 drop-shadow-lg">.</span>
                </Link>

                <div className="flex gap-4 items-center">


                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-md transition-all duration-500 ${estaOnline
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                        {estaOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                        <span className="text-[10px] font-bold tracking-widest uppercase">
                            {estaOnline ? 'ONLINE' : 'OFFLINE'}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
                {/* Scanner Container Clean */}
                {/* Scanner Container Clean */}
                <div className={`relative w-full max-w-sm aspect-square bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 ${corDoDia ? `ring-1 ${corDoDia.classe.replace('border', 'ring')}` : ''}`}>
                    {!modoManual ? (
                        <>
                            <div id="reader" className="w-full h-full object-cover opacity-80"></div>

                            {/* Overlay Container - Restored */}
                            <div className="absolute inset-0 z-10 pointer-events-none">
                                <div className="absolute top-8 left-8 w-8 h-8 border-t-4 border-l-4 border-white/80 rounded-tl-2xl drop-shadow-lg"></div>
                                <div className="absolute top-8 right-8 w-8 h-8 border-t-4 border-r-4 border-white/80 rounded-tr-2xl drop-shadow-lg"></div>
                                <div className="absolute bottom-8 left-8 w-8 h-8 border-b-4 border-l-4 border-white/80 rounded-bl-2xl drop-shadow-lg"></div>
                                <div className="absolute bottom-8 right-8 w-8 h-8 border-b-4 border-r-4 border-white/80 rounded-br-2xl drop-shadow-lg"></div>
                                <div className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[varredura_1.5s_ease-in-out_infinite] top-1/2"></div>
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center p-6 text-center">
                            <Search className="w-12 h-12 text-zinc-700 mb-4" />
                            <p className="text-zinc-500 text-sm">Modo Manual</p>
                        </div>
                    )}
                </div>

                {/* Status Text (Idle) */}
                {scannerAtivo && !modoManual && (
                    <div className="mt-8 text-center opacity-50">
                        <p className="text-sm font-medium tracking-wide">Aguardando leitura...</p>
                    </div>
                )}

                {/* Date Display */}
                <div className="mt-8 text-center opacity-30">
                    <p className="text-xs font-mono tracking-widest uppercase">
                        {format(obterDataCorrigida(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </p>
                </div>

                {/* Botão Modo Manual Minimalista */}
                <div className="fixed bottom-8 right-8">
                    <button
                        onClick={() => definirModoManual(!modoManual)}
                        className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-full backdrop-blur-md transition-all active:scale-95 shadow-lg border border-white/5"
                    >
                        {modoManual ? <Zap className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                    </button>
                </div>
            </main>

            {/* Manual Entry Sheet */}
            {modoManual && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 transition-opacity" onClick={() => definirModoManual(false)} />
            )}

            <div className={`fixed bottom-0 left-0 w-full bg-zinc-900 rounded-t-3xl p-6 shadow-2xl transform transition-transform duration-300 z-40 border-t border-white/10 ${modoManual ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="w-full flex justify-center mb-6" onClick={() => definirModoManual(false)}>
                    <div className="w-12 h-1 bg-zinc-700 rounded-full cursor-pointer hover:bg-zinc-600 transition-colors"></div>
                </div>

                <form onSubmit={aoEnviarManual}>
                    <input
                        type="text"
                        value={matriculaManual}
                        onChange={(e) => definirMatriculaManual(e.target.value)}
                        placeholder="Matrícula"
                        className="w-full bg-zinc-800 border-none rounded-xl px-4 py-4 text-center text-lg text-white placeholder-zinc-600 focus:ring-1 focus:ring-blue-500 focus:outline-none mb-4 font-mono transition-colors"
                        autoFocus={modoManual}
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 mb-4"
                    >
                        Confirmar
                    </button>
                </form>
            </div>

            {/* Full Screen Result Overlay */}
            {ultimoResultado && (
                <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-8 transition-all duration-300 ${ultimoResultado.status === 'sucesso' ? 'bg-emerald-600' :
                    ultimoResultado.status === 'erro' ? 'bg-red-600' :
                        'bg-amber-500'
                    }`} onClick={() => definirUltimoResultado(null)}>

                    <div className="mb-6 p-6 bg-white/20 rounded-full shadow-lg backdrop-blur-sm">
                        {ultimoResultado.status === 'sucesso' ? <Check className="w-12 h-12 text-white" /> :
                            ultimoResultado.status === 'erro' ? <X className="w-12 h-12 text-white" /> :
                                <AlertTriangle className="w-12 h-12 text-white" />}
                    </div>

                    <h1 className="text-3xl font-bold text-white tracking-tight uppercase mb-2 text-center">
                        {ultimoResultado.status === 'sucesso' ? 'Acesso Liberado' :
                            ultimoResultado.status === 'erro' ? 'Acesso Negado' :
                                'Atenção'}
                    </h1>

                    <p className="text-lg text-white/90 font-medium mb-10 text-center max-w-md leading-relaxed opacity-90">
                        {ultimoResultado.mensagem}
                    </p>

                    {ultimoResultado.aluno && (
                        <div className="bg-black/20 p-6 rounded-2xl w-full max-w-sm backdrop-blur-md text-center border border-white/10">
                            <h2 className="text-2xl font-bold text-white mb-1 leading-tight truncate">
                                {ultimoResultado.aluno.nome_completo}
                            </h2>
                            <p className="text-sm text-white/60 font-mono tracking-wider">
                                {ultimoResultado.aluno.turma_id}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
