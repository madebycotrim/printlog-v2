import { useState, useEffect, useRef } from 'react';

export function useLeitorHID(aoLerCodigo) {
    const [conectado, definirConectado] = useState(false);
    const [dispositivo, definirDispositivo] = useState(null);
    const bufferRef = useRef('');
    const ultimoTempoRef = useRef(0);

    // Conectar ao dispositivo HID
    const conectar = async () => {
        try {
            // Solicita ao usuário a seleção de um dispositivo HID
            // Filtros podem ser adicionados se o VendorID/ProductID for conhecido
            // Sem filtros = lista todos os dispositivos HID disponíveis
            const dispositivos = await navigator.hid.requestDevice({ filters: [] });

            if (dispositivos.length > 0) {
                const dispositivoHID = dispositivos[0];
                await dispositivoHID.open();
                definirDispositivo(dispositivoHID);
                definirConectado(true);

                dispositivoHID.addEventListener('inputreport', lidarComEntrada);
                console.log(`Leitor HID conectado: ${dispositivoHID.productName}`);
            }
        } catch (erro) {
            console.error('Erro ao conectar leitor HID:', erro);
        }
    };

    // Lidar com os dados brutos do HID
    const lidarComEntrada = () => {
        // Implementação futura para leitura direta de HID
        // const { data: dados } = evento;
        // A maioria dos leitores envia caracteres ASCII ou Scancodes
        // Esta implementação é genérica e pode precisar de ajustes baseados no hardware específico
        // Assume que o leitor envia dados convertíveis para Uint8Array

        // const arrayBytes = new Uint8Array(dados.buffer);
        // let caractere = '';

        // Tentativa simplificada de decodificação (para leitores em modo teclado/HID POS)
        // Nota: Scancodes de teclado USB são complexos para decodificar manualmente sem uma tabela grande
        // Se o leitor estiver em modo "Emulação de Teclado", ele dispara eventos de teclado window 'keydown', não HID 'inputreport'
        // Se estiver em modo "HID POS" ou "Vendor Specific", ele dispara 'inputreport'

        // Estratégia Híbrida:
        // 1. Se recebermos inputreport, tentamos processar (avançado)
        // 2. Mantemos um listener de 'keydown' global como fallback (padrão de mercado)
    };

    // Fallback: Listener de Teclado (Padrão para leitores USB/Bluetooth comerciais)
    // Leitores de código de barras geralmente agem como teclados rápidos
    useEffect(() => {
        const lidarComTeclado = (e) => {
            // Ignorar se o foco estiver em um input de texto (como a busca manual)
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const agora = Date.now();

            // Se passou muito tempo desde a última tecla, assume novo código (reset buffer)
            if (agora - ultimoTempoRef.current > 100) {
                bufferRef.current = '';
            }

            ultimoTempoRef.current = agora;

            // Detectar 'Enter' como fim do código
            if (e.key === 'Enter') {
                if (bufferRef.current.length > 0) {
                    aoLerCodigo(bufferRef.current);
                    bufferRef.current = '';
                }
            } else if (e.key.length === 1) {
                // Acumula caracteres imprimíveis
                bufferRef.current += e.key;
            }
        };

        window.addEventListener('keydown', lidarComTeclado);
        return () => window.removeEventListener('keydown', lidarComTeclado);
    }, [aoLerCodigo]);

    return {
        conectar,
        conectado,
        nomeDispositivo: dispositivo ? dispositivo.productName : null
    };
}
