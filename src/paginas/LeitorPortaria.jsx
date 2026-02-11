import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../servicos/api';
import { Shield, Zap, Wifi, WifiOff, Search, X, Check, AlertTriangle, User, Palette, Lock, Unlock } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { bancoLocal } from '../servicos/bancoLocal';
import { tocarBeep } from '../utilitarios/audio';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import logo from '../assets/logo.png';
import { usarLeitorHID } from '../hooks/usarLeitorHID';
import { obterCorDoDia } from '../utilitarios/validacaoVisual';
import { validarQRSeguro } from '../utilitarios/seguranca';
import { obterDataCorrigida } from '../utilitarios/relogio';

// v3.0 - TTS (Text-to-Speech)
const anunciarNome = (nome) => {
    if (!('speechSynthesis' in window)) return;

    // Cancelar falas anteriores
    window.speechSynthesis.cancel();

    // Criar nova fala
    const mensagem = new SpeechSynthesisUtterance(nome.toLowerCase()); // Lowercase ajuda na pronúncia às vezes
    mensagem.lang = 'pt-BR';
    mensagem.rate = 1.1; // Um pouco mais rápido que o normal
    mensagem.pitch = 1.0;

    // Tentar encontrar voz em português
    const vozes = window.speechSynthesis.getVoices();
    const vozPT = vozes.find(v => v.lang.includes('PT') || v.lang.includes('br'));
    if (vozPT) mensagem.voice = vozPT;

    window.speechSynthesis.speak(mensagem);
};


// Hook de status online robusto
function usarStatusConexao() {
    const [estaOnline, definirEstaOnline] = useState(navigator.onLine);

    useEffect(() => {
        const verificarConexao = async () => {
            try {
                // Tenta buscar um recurso leve para validar conectividade real
                const resposta = await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-store' });
                definirEstaOnline(resposta.ok);
            } catch {
                definirEstaOnline(false);
            }
        };

        const aoConectar = () => {
            definirEstaOnline(true);
            verificarConexao(); // Validação dupla
        };
        const aoDesconectar = () => definirEstaOnline(false);

        window.addEventListener('online', aoConectar);
        window.addEventListener('offline', aoDesconectar);

        // Verificação periódica a cada 20s
        const intervalo = setInterval(verificarConexao, 20000);

        // Verificação inicial
        verificarConexao();

        return () => {
            window.removeEventListener('online', aoConectar);
            window.removeEventListener('offline', aoDesconectar);
            clearInterval(intervalo);
        };
    }, []);
    return estaOnline;
}

export default function LeitorPortaria() {
    const [ultimoResultado, definirUltimoResultado] = useState(null);
    const [scannerAtivo, definirScannerAtivo] = useState(true);
    const refScanner = useRef(null);
    const estaOnline = usarStatusConexao();
    const [modoManual, definirModoManual] = useState(false);
    const [matriculaManual, definirMatriculaManual] = useState('');
    const [processando, definirProcessando] = useState(false);

    // v2.5 - Validação Visual
    const [corDoDia, definirCorDoDia] = useState(null);

    useEffect(() => {
        definirCorDoDia(obterCorDoDia());
    }, []);

    // v2.5 - Suporte a HID / Teclado
    const aoLerHID = (codigo) => {
        console.log('Código recebido via HID/Teclado:', codigo);
        processarEntrada(codigo);
    };

    const { conectar: conectarHID, conectado: hidConectado, nomeDispositivo } = usarLeitorHID(aoLerHID);

    const processarEntrada = async (codigoEntrada) => {
        if (!scannerAtivo || processando) return;
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
                        // Se parece um token mas falhou, rejeita por segurança
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
                    // Fallback para tratar como texto simples se não for JWT válido mas estrutura parecer
                }
            } else {
                // Código legado (apenas matrícula em texto plano)
                // TODO: Futuramente bloquear códigos não assinados
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
                    mensagem: `JÁ REGISTRADO ÀS ${horarioAntigo}`,
                    aluno,
                    autentico: autentico // Passar flag para UI
                });
                resetarScannerEm(3000);
                return;
            }

            // Define saudação para TTS
            const horaAtual = new Date().getHours();
            const saudacao = horaAtual < 12 ? 'Bom dia, ' : horaAtual < 18 ? 'Boa tarde, ' : 'Boa noite, ';

            // 3. Registrar Acesso
            // Lógica simples: Se tem registro hoje par (entrada, saída), próximo é entrada. Se ímpar (entrada), próximo é saída.
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
                metodo_validacao: autentico ? 'HMAC' : 'LEGADO' // Audit Trail
            };

            await bancoLocal.salvarRegistro(registro);

            // v3.0 - Hybrid Sync (Fire-and-Forget)
            // Tenta enviar para API imediatamente sem bloquear. 
            // Se falhar, o ServiceWorker/Sincronizacao pega depois.
            if (navigator.onLine) {
                api.enviar('/acessos', [registro]).then(() => {
                    // Se sucesso, marca como sincronizado localmente
                    bancoLocal.marcarComoSincronizado([registro.id]);
                    console.log('Acesso sincronizado em background.');
                }).catch(e => console.warn('Falha no envio imediato (será tentado depois):', e));
            }

            tocarBeep('sucesso');
            anunciarNome(saudacao + aluno.nome_completo.split(' ')[0]); // "Bom dia, João"

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
    };

    const resetarScannerEm = (ms) => {
        setTimeout(() => {
            definirUltimoResultado(null);
            definirScannerAtivo(true);
            if (modoManual) {
                definirMatriculaManual('');
            }
        }, ms);
    }

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
            (mensagemErro) => {
                // Ignorar erros de leitura frame a frame
            }
        ).catch(erro => {
            console.error("Erro ao iniciar scanner:", erro);
        });

        refScanner.current = leitorQr;

        return () => {
            if (leitorQr.isScanning) {
                leitorQr.stop()
                    .then(() => {
                        // Only clear if stop succeeded
                        return leitorQr.clear();
                    })
                    .catch(erro => {
                        console.warn("Erro ao parar:", erro);
                    });
            } else {
                try {
                    const promessaLimpeza = leitorQr.clear();
                    if (promessaLimpeza && typeof promessaLimpeza.catch === 'function') {
                        promessaLimpeza.catch(erro => console.warn("Erro ao limpar:", erro));
                    }
                } catch (e) {
                    console.warn("Erro síncrono ao limpar:", e);
                }
            }
        };
    }, [modoManual]);

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
                <Link to="/painel" className="group flex items-center gap-3 transition-all hover:opacity-80">
                    {/* SCAE Text Logo */}
                    <div className="flex items-center gap-1 group-hover:scale-105 transition-transform">
                        <span className="text-3xl font-black tracking-tighter text-white drop-shadow-lg">SCAE</span>
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    </div>
                </Link>

                <div className="flex gap-4 items-center">
                    {/* Visual Validation Badge */}
                    {corDoDia && (
                        <div className={`hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full border bg-black/30 backdrop-blur-md ${corDoDia.classe} shadow-lg`}>
                            <Palette className={`w-4 h-4 ${corDoDia.text || 'text-white'}`} />
                            <span className="text-xs font-bold uppercase tracking-wider text-white">
                                {corDoDia.nome}
                            </span>
                            <div className={`w-3 h-3 rounded-full ${corDoDia.bg} animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]`}></div>
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md transition-all duration-500 ${estaOnline
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                        }`}>
                        <div className={`relative flex items-center justify-center w-2 h-2`}>
                            <div className={`absolute w-full h-full rounded-full ${estaOnline ? 'bg-emerald-400 animate-ping opacity-75' : 'bg-red-400'}`}></div>
                            <div className={`relative w-1.5 h-1.5 rounded-full ${estaOnline ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        </div>

                        {estaOnline ? (
                            <Wifi className="w-4 h-4" strokeWidth={2.5} />
                        ) : (
                            <WifiOff className="w-4 h-4" strokeWidth={2.5} />
                        )}

                        <span className="text-[10px] font-black tracking-widest uppercase hidden sm:block">
                            {estaOnline ? 'CONECTADO' : 'SEM CONEXÃO'}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">

                {/* Scanner Container */}
                <div className={`relative w-full max-w-sm aspect-square bg-black rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${scannerAtivo ? 'shadow-blue-500/20 ring-1 ring-white/10' : 'opacity-50 grayscale'} ${corDoDia ? `ring-2 ${corDoDia.classe.replace('border', 'ring')}` : ''}`}>

                    {/* Visual Validation Border (Active Pulse) */}
                    {corDoDia && scannerAtivo && !modoManual && (
                        <div className={`absolute inset-0 pointer-events-none border-[6px] ${corDoDia.classe} opacity-50 z-20 animate-pulse`}></div>
                    )}

                    {!modoManual ? (
                        <>
                            <div id="reader" className="w-full h-full object-cover"></div>

                            {/* Overlay Container */}
                            <div className="absolute inset-0 z-10 pointer-events-none">
                                {/* Soft Glow Corners - Less aggressive, more friendly */}
                                <div className="absolute top-8 left-8 w-8 h-8 border-t-4 border-l-4 border-white/80 rounded-tl-2xl drop-shadow-lg"></div>
                                <div className="absolute top-8 right-8 w-8 h-8 border-t-4 border-r-4 border-white/80 rounded-tr-2xl drop-shadow-lg"></div>
                                <div className="absolute bottom-8 left-8 w-8 h-8 border-b-4 border-l-4 border-white/80 rounded-bl-2xl drop-shadow-lg"></div>
                                <div className="absolute bottom-8 right-8 w-8 h-8 border-b-4 border-r-4 border-white/80 rounded-br-2xl drop-shadow-lg"></div>

                                {/* Fast & Smooth Laser */}
                                <div className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[varredura_1.5s_ease-in-out_infinite] top-1/2"></div>
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
                            <Search className="w-16 h-16 text-gray-700 mb-4" />
                            <p className="text-gray-500 text-sm">Modo de Identificação Manual</p>
                        </div>
                    )}
                </div>

                {/* Status Text (Idle) */}
                {scannerAtivo && !modoManual && (
                    <div className="mt-8 text-center animate-pulse">
                        <p className="text-blue-200 font-medium tracking-wide">Aguardando leitura...</p>
                        <p className="text-xs text-blue-400/50 mt-1 font-mono">Mantenha o QR Code centralizado</p>
                    </div>
                )}

                {/* Date Display */}
                <div className="mt-8 text-center">
                    <p className="text-2xl font-bold text-white uppercase tracking-wider drop-shadow-md">
                        {format(obterDataCorrigida(), "EEEE", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-white/50 font-mono tracking-widest">
                        {format(obterDataCorrigida(), "dd 'DE' MMMM 'DE' yyyy", { locale: ptBR })}
                    </p>
                </div>

                {/* Friendly Floating Action Button for Manual Mode */}
                <div className="flex gap-4 mt-8">
                    <button
                        onClick={() => definirModoManual(!modoManual)}
                        className="group relative px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white transition-all duration-300 active:scale-95 backdrop-blur-xl flex items-center gap-3 shadow-lg hover:shadow-blue-500/10"
                    >
                        <div className={`p-1.5 rounded-full transition-colors ${modoManual ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white'}`}>
                            {modoManual ? <Zap className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                        </div>
                        <span className="text-sm font-medium tracking-wide">
                            {modoManual ? 'Ativar Câmera' : 'Digitar Matrícula'}
                        </span>
                    </button>

                    {/* Botão HID (Oculto se não suportado) */}
                    {'hid' in navigator && (
                        <button
                            onClick={conectarHID}
                            className={`group relative px-4 py-3 border border-white/10 rounded-full text-white transition-all duration-300 active:scale-95 backdrop-blur-xl flex items-center gap-2 shadow-lg ${hidConectado ? 'bg-green-500/20 border-green-500/30' : 'bg-white/5 hover:bg-white/10'}`}
                            title={hidConectado ? `Conectado: ${nomeDispositivo}` : "Conectar Leitor USB/Bluetooth"}
                        >
                            <div className={`p-1.5 rounded-full transition-colors ${hidConectado ? 'bg-green-500 text-white' : 'bg-white/10 text-white'}`}>
                                <Zap className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium tracking-wide hidden sm:inline">
                                {hidConectado ? 'HID Ativo' : 'Conectar Leitor'}
                            </span>
                        </button>
                    )}
                </div>
            </main>

            {/* Manual Entry Sheet */}
            {modoManual && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity"
                    onClick={() => definirModoManual(false)}
                />
            )}

            <div className={`fixed bottom-0 left-0 w-full bg-[#0f172a] rounded-t-3xl p-6 shadow-2xl transform transition-transform duration-300 z-40 border-t border-white/10 ${modoManual ? 'translate-y-0' : 'translate-y-full'
                }`}>

                {/* Drag Handle / Close Area */}
                <div className="w-full flex justify-center mb-6" onClick={() => definirModoManual(false)}>
                    <div className="w-12 h-1.5 bg-gray-700 rounded-full cursor-pointer hover:bg-gray-600 transition-colors"></div>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Registro Manual</h3>
                    <button
                        onClick={() => definirModoManual(false)}
                        className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-300" />
                    </button>
                </div>

                <p className="text-gray-400 text-xs mb-6">Utilize apenas se o QR Code estiver danificado.</p>

                <form onSubmit={aoEnviarManual}>
                    <input
                        type="text"
                        value={matriculaManual}
                        onChange={(e) => definirMatriculaManual(e.target.value)}
                        placeholder="Matrícula ou Nome"
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-4 text-center text-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none mb-4 font-mono transition-colors"
                        autoFocus={modoManual}
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 mb-4"
                    >
                        REGISTRAR ACESSO
                    </button>
                </form>
            </div>

            {/* Full Screen Result Overlay */}
            {ultimoResultado && (
                <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-8 backdrop-blur-xl transition-all duration-300 ${ultimoResultado.status === 'sucesso' ? 'bg-green-600/90' :
                    ultimoResultado.status === 'erro' ? 'bg-red-600/90' :
                        'bg-yellow-500/95'
                    }`} onClick={() => definirUltimoResultado(null)}>

                    {/* Icon */}
                    <div className="mb-6 p-6 bg-white/20 rounded-full shadow-2xl backdrop-blur-sm animate-bounce">
                        {ultimoResultado.status === 'sucesso' ? <Check className="w-16 h-16 text-white" strokeWidth={3} /> :
                            ultimoResultado.status === 'erro' ? <X className="w-16 h-16 text-white" strokeWidth={3} /> :
                                <AlertTriangle className="w-16 h-16 text-white" strokeWidth={3} />}
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase mb-2 text-center drop-shadow-md">
                        {ultimoResultado.status === 'sucesso' ? 'LIBERADO' :
                            ultimoResultado.status === 'erro' ? 'RECUSADO' :
                                'ATENÇÃO'}
                    </h1>

                    {/* Message */}
                    <p className="text-xl text-white/90 font-medium mb-10 text-center max-w-md leading-relaxed">
                        {ultimoResultado.mensagem}
                    </p>

                    {/* Student Info Card */}
                    {ultimoResultado.aluno && (
                        <div className="bg-white/10 border border-white/20 p-6 rounded-2xl w-full max-w-sm backdrop-blur-md shadow-xl text-center">
                            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-white/30 text-gray-400">
                                <User className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1 uppercase leading-tight truncate">
                                {ultimoResultado.aluno.nome_completo}
                            </h2>
                            <p className="text-lg text-white/80 font-mono">
                                TURMA {ultimoResultado.aluno.turma_id}
                            </p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="absolute bottom-10 animate-pulse text-white/60 text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                        {ultimoResultado.autentico ? (
                            <span className="flex items-center gap-1 text-green-300 bg-green-900/40 px-3 py-1 rounded-full border border-green-500/30">
                                <Lock className="w-3 h-3" /> ASSINATURA DIGITAL VALIDADA
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-yellow-300 bg-yellow-900/40 px-3 py-1 rounded-full border border-yellow-500/30">
                                <Unlock className="w-3 h-3" /> CÓDIGO LEGADO (SEM CRIPTOGRAFIA)
                            </span>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}
