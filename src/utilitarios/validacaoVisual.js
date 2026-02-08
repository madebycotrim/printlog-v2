import { format } from 'date-fns';
import { obterDataCorrigida } from './relogio';

// Paleta de cores de segurança (excluindo vermelho/amarelo de alerta)
const CORES_VALIDACAO = [
    { nome: 'AZUL REAL', classe: 'border-blue-500', bg: 'bg-blue-500', hex: '#3b82f6' },
    { nome: 'VERDE ESMERALDA', classe: 'border-emerald-500', bg: 'bg-emerald-500', hex: '#10b981' },
    { nome: 'ROXO AMETISTA', classe: 'border-purple-500', bg: 'bg-purple-500', hex: '#a855f7' },
    { nome: 'ROSA MAGENTA', classe: 'border-pink-500', bg: 'bg-pink-500', hex: '#ec4899' },
    { nome: 'LARANJA SOLAR', classe: 'border-orange-500', bg: 'bg-orange-500', hex: '#f97316' },
    { nome: 'CIANO OCEANO', classe: 'border-cyan-500', bg: 'bg-cyan-500', hex: '#06b6d4' },
    { nome: 'INDIGO PROFUNDO', classe: 'border-indigo-500', bg: 'bg-indigo-500', hex: '#6366f1' },
];

export function obterCorDoDia() {
    const hoje = format(obterDataCorrigida(), 'yyyy-MM-dd');

    // Hash simples da data para índice determinístico
    let hash = 0;
    for (let i = 0; i < hoje.length; i++) {
        hash = hoje.charCodeAt(i) + ((hash << 5) - hash);
    }

    const indice = Math.abs(hash) % CORES_VALIDACAO.length;
    return CORES_VALIDACAO[indice];
}
