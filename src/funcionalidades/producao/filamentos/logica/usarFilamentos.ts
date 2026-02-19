import { useState, useEffect } from 'react';
import type { Filamento } from '@/compartilhado/tipos_globais/modelos';

// Dados iniciais mockados para teste
const DADOS_INICIAIS: Filamento[] = [
    {
        id: '1',
        marca: 'Voolt3D',
        material: 'PLA',
        cor: 'Azul Cobalto',
        cor_hex: '#0047AB',
        peso_total_g: 1000,
        peso_restante_g: 850,
        preco_kg: 120.00
    },
    {
        id: '2',
        marca: '3D Fila',
        material: 'ABS',
        cor: 'Preto',
        cor_hex: '#111111',
        peso_total_g: 1000,
        peso_restante_g: 120,
        preco_kg: 110.50
    },
    {
        id: '3',
        marca: 'Voolt3D',
        material: 'PETG',
        cor: 'Laranja',
        cor_hex: '#FF8C00',
        peso_total_g: 1000,
        peso_restante_g: 980,
        preco_kg: 135.90
    }
];

export function usarFilamentos() {
    const [filamentos, definirFilamentos] = useState<Filamento[]>([]);

    useEffect(() => {
        // Simular carregamento do localStorage ou API
        const dadosSalvos = localStorage.getItem('printlog_filamentos');
        if (dadosSalvos) {
            definirFilamentos(JSON.parse(dadosSalvos));
        } else {
            definirFilamentos(DADOS_INICIAIS);
        }
    }, []);

    useEffect(() => {
        // Persistir mudanças
        if (filamentos.length > 0) {
            localStorage.setItem('printlog_filamentos', JSON.stringify(filamentos));
        }
    }, [filamentos]);

    function adicionarFilamento(novoFilamento: Omit<Filamento, 'id'>) {
        const filamento: Filamento = {
            ...novoFilamento,
            id: crypto.randomUUID(),
            data_cadastro: new Date().toISOString()
        };
        definirFilamentos(prev => [...prev, filamento]);
    }

    function editarFilamento(id: string, dadosAtualizados: Partial<Omit<Filamento, 'id'>>) {
        definirFilamentos(prev => prev.map(f =>
            f.id === id ? { ...f, ...dadosAtualizados } : f
        ));
    }

    function removerFilamento(id: string) {
        definirFilamentos(prev => prev.filter(f => f.id !== id));
    }

    function atualizarPeso(id: string, novoPeso: number) {
        definirFilamentos(prev => prev.map(f =>
            f.id === id ? { ...f, peso_restante_g: novoPeso } : f
        ));
    }

    return {
        filamentos,
        adicionarFilamento,
        editarFilamento,
        removerFilamento,
        atualizarPeso
    };
}
