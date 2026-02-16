import { useState, useEffect } from 'react';
import LayoutAdministrativo from '../componentes/LayoutAdministrativo';
import { bancoLocal } from '../servicos/bancoLocal';
import {
    FileText,
    Download,
    Calendar,
    Filter,
    BarChart2,
    PieChart,
    Table,
    FileSpreadsheet,
    FileCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function Relatorios() {
    const [estatisticas, definirEstatisticas] = useState({
        totalRegistros: 0,
        registrosHoje: 0,
        turmaMaisAtiva: '-',
        horarioPico: '-'
    });
    const [carregando, definirCarregando] = useState(true);

    useEffect(() => {
        carregarEstatisticas();
    }, []);

    const carregarEstatisticas = async () => {
        try {
            definirCarregando(true);
            const banco = await bancoLocal.iniciarBanco();
            const registros = await banco.getAll('registros_acesso');

            // Simulação de cálculo de estatísticas
            definirEstatisticas({
                totalRegistros: registros.length,
                registrosHoje: registros.filter(r => r.timestamp.startsWith(new Date().toISOString().split('T')[0])).length,
                turmaMaisAtiva: '3º A', // Placeholder logic
                horarioPico: '07:00 - 08:00' // Placeholder logic
            });
        } catch (e) {
            console.error(e);
        } finally {
            definirCarregando(false);
        }
    };

    const gerarRelatorio = (tipo) => {
        const toastId = toast.loading(`Gerando relatório: ${tipo}...`);
        setTimeout(() => {
            toast.success('Relatório gerado com sucesso!', { id: toastId });
            // Aqui entraria a lógica real de download
        }, 2000);
    };

    const CardRelatorio = ({ titulo, descricao, icone: Icone, cor, onClick }) => (
        <button
            onClick={onClick}
            className="flex flex-col items-start p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-left group w-full"
        >
            <div className={`p-3 rounded-xl bg-${cor}-50 text-${cor}-600 mb-4 group-hover:scale-110 transition-transform`}>
                <Icone size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">{titulo}</h3>
            <p className="text-sm text-slate-500 mb-4 flex-1">{descricao}</p>

            <div className={`mt-auto flex items-center gap-2 text-sm font-bold text-${cor}-600 group-hover:underline`}>
                <Download size={16} />
                Baixar Arquivo
            </div>
        </button>
    );

    return (
        <LayoutAdministrativo titulo="Central de Relatórios" subtitulo="Exportação de dados e estatísticas oficiais">

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-600/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <FileText size={80} />
                    </div>
                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Total de Registros</p>
                    <p className="text-3xl font-black">{estatisticas.totalRegistros}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Acessos Hoje</p>
                    <p className="text-3xl font-black text-slate-800">{estatisticas.registrosHoje}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Turma + Ativa</p>
                    <p className="text-3xl font-black text-slate-800">{estatisticas.turmaMaisAtiva}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Horário de Pico</p>
                    <p className="text-xl font-black text-slate-800 pt-1.5">{estatisticas.horarioPico}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Action Area */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FileCheck className="text-emerald-500" size={20} />
                        Relatórios Oficiais (SEEDF)
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CardRelatorio
                            titulo="Frequência Diária"
                            descricao="Relatório detalhado de entradas e saídas do dia atual, agrupado por turmas."
                            icone={Calendar}
                            cor="emerald"
                            onClick={() => gerarRelatorio('Diário')}
                        />
                        <CardRelatorio
                            titulo="Fechamento Mensal"
                            descricao="Consolidado de presença do mês para envio à secretaria de educação."
                            icone={FileSpreadsheet}
                            cor="blue"
                            onClick={() => gerarRelatorio('Mensal')}
                        />
                        <CardRelatorio
                            titulo="Risco de Evasão"
                            descricao="Lista de alunos com baixo índice de frequência nos últimos 30 dias."
                            icone={PieChart}
                            cor="amber"
                            onClick={() => gerarRelatorio('Evasão')}
                        />
                        <CardRelatorio
                            titulo="Log de Auditoria"
                            descricao="Histórico completo de ações no sistema para fins de auditoria e segurança."
                            icone={Table}
                            cor="slate"
                            onClick={() => gerarRelatorio('Auditoria')}
                        />
                    </div>
                </div>

                {/* Filters Sidebar */}
                <div className="bg-white h-fit rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6 flex items-center gap-2">
                        <Filter size={16} /> Filtros Personalizados
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Data Inicial</label>
                            <input type="date" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Data Final</label>
                            <input type="date" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Turma Específica</label>
                            <select className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm">
                                <option>Todas</option>
                                <option>1º Ano A</option>
                            </select>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-sm shadow-md shadow-indigo-500/20">
                                Aplicar Filtros
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </LayoutAdministrativo>
    );
}
