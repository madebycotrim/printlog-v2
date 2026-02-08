import { differenceInMilliseconds } from 'date-fns';

const CHAVE_OFFSET = 'scae_relogio_offset';

// Obtém o offset salvo ou 0
let offsetGlobal = Number(localStorage.getItem(CHAVE_OFFSET) || 0);

export const sincronizarRelogio = async () => {
    try {
        const inicio = Date.now();
        // Faz uma requisição HEAD leve para pegar o cabeçalho Date do servidor/CDN
        const resposta = await fetch(window.location.origin, { method: 'HEAD', cache: 'no-store' });
        const fim = Date.now();

        const dateHeader = resposta.headers.get('date');
        if (!dateHeader) return;

        const dataServidor = new Date(dateHeader).getTime();
        const latencia = (fim - inicio) / 2; // Estima latência de ida

        // Data do servidor ajustada pela latência
        const dataServidorReal = dataServidor + latencia;

        // Calcula a diferença: Servidor - Local
        // Se offset > 0, o servidor está à frente (relógio local atrasado)
        // Se offset < 0, o servidor está atrás (relógio local adiantado)
        offsetGlobal = dataServidorReal - Date.now();

        localStorage.setItem(CHAVE_OFFSET, offsetGlobal.toString());

        console.log(`Relógio sincronizado. Offset: ${offsetGlobal}ms (${(offsetGlobal / 1000).toFixed(2)}s)`);

        return offsetGlobal;
    } catch (erro) {
        console.warn('Falha ao sincronizar relógio:', erro);
        return offsetGlobal; // Retorna o último conhecido
    }
};

export const obterDataCorrigida = () => {
    return new Date(Date.now() + offsetGlobal);
};

// Auto-inicia sincronização se online
if (typeof window !== 'undefined' && navigator.onLine) {
    sincronizarRelogio();
    // Re-sincroniza a cada 10 minutos
    setInterval(sincronizarRelogio, 10 * 60 * 1000);
}

// Escuta evento online para forçar sync
if (typeof window !== 'undefined') {
    window.addEventListener('online', sincronizarRelogio);
}
