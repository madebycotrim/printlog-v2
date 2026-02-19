import { useMemo } from 'react';

// ─── Utilitário de cores ──────────────────────────────────────────────────────
/**
 * Gera variações de cor (base, claro, escuro) a partir de um hex.
 * Usado internamente pelos componentes SVG de material.
 */
export function gerarCores(hex: string) {
    let h = String(hex || '#3b82f6').replace(/^#/, '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    if (!/^[0-9A-Fa-f]{6}$/.test(h)) h = '3b82f6';
    const n = parseInt(h, 16);
    const s = 0.1;
    const r = Math.round(((n >> 16) & 255) * (1 - s) + 128 * s);
    const g = Math.round(((n >> 8) & 255) * (1 - s) + 128 * s);
    const b = Math.round((n & 255) * (1 - s) + 128 * s);
    return {
        base: `rgb(${r},${g},${b})`,
        claro: `rgb(${Math.min(255, Math.floor(r * 1.25))},${Math.min(255, Math.floor(g * 1.25))},${Math.min(255, Math.floor(b * 1.25))})`,
        escuro: `rgb(${Math.floor(r * 0.65)},${Math.floor(g * 0.65)},${Math.floor(b * 0.65)})`,
    };
}

// ─── Props compartilhadas ─────────────────────────────────────────────────────
export interface PropsMaterial {
    /** Cor hex do material, ex: '#f59e0b' */
    cor?: string;
    /** Porcentagem de preenchimento (0–100) */
    porcentagem?: number;
    /** Tamanho em px do SVG (largura = altura) */
    tamanho?: number;
    /**
     * ID único para os gradientes/masks SVG.
     * Deve ser único por instância na página para evitar conflitos de defs.
     */
    id: string;
}

// ─── Carretel 3D (FDM) ───────────────────────────────────────────────────────
/**
 * Visualização de carretel de filamento FDM em SVG 3D.
 * O nível de filamento é proporcional à `porcentagem`.
 */
export function Carretel({ cor = '#3b82f6', porcentagem = 100, tamanho = 64, id }: PropsMaterial) {
    const { base, claro, escuro } = useMemo(() => gerarCores(cor), [cor]);
    const pct = Math.max(2, Math.min(100, porcentagem));

    const cY = 50, zT = 32, zF = 68;
    const raioAroY = 46, raioAroX = 23;
    const raioNucleoY = 11, raioNucleoX = 5.5;
    const raioLeito = 11, raioLeitoX = 5.5;
    const maxFY = 44, maxFX = 21, esp = 5;

    const rY = raioLeito + (maxFY - raioLeito) * (pct / 100);
    const rX = raioLeitoX + (maxFX - raioLeitoX) * (pct / 100);

    const ehEscuro = useMemo(() => {
        const rgb = parseInt(cor.replace('#', ''), 16);
        return (0.2126 * ((rgb >> 16) & 0xff) + 0.7152 * ((rgb >> 8) & 0xff) + 0.0722 * (rgb & 0xff)) < 40;
    }, [cor]);
    const ct = ehEscuro ? { stroke: 'rgba(255,255,255,0.15)', strokeWidth: '0.5' } : {};

    return (
        <svg viewBox="0 0 100 100" style={{ width: tamanho, height: tamanho }} overflow="visible">
            <defs>
                <linearGradient id={`cf-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={claro} />
                    <stop offset="30%" stopColor={base} />
                    <stop offset="100%" stopColor={escuro} />
                </linearGradient>
                <linearGradient id={`cp-${id}`} x1="0" y1="0" x2="0.6" y2="1">
                    <stop offset="0%" stopColor="#52525b" />
                    <stop offset="100%" stopColor="#18181b" />
                </linearGradient>
                <linearGradient id={`ca-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#52525b" />
                    <stop offset="50%" stopColor="#27272a" />
                    <stop offset="100%" stopColor="#09090b" />
                </linearGradient>
                <mask id={`cmv-${id}`}>
                    <rect x="0" y="0" width="100" height="100" fill="white" />
                    <g transform={`translate(${zF},${cY})`}>
                        {[0, 60, 120, 180, 240, 300].map(ang => (
                            <path key={ang} d={`
                                M ${Math.cos((ang + 18) * Math.PI / 180) * 7} ${Math.sin((ang + 18) * Math.PI / 180) * 15}
                                L ${Math.cos((ang + 18) * Math.PI / 180) * 18} ${Math.sin((ang + 18) * Math.PI / 180) * 36}
                                A 18 36 0 0 1 ${Math.cos((ang + 42) * Math.PI / 180) * 18} ${Math.sin((ang + 42) * Math.PI / 180) * 36}
                                L ${Math.cos((ang + 42) * Math.PI / 180) * 7} ${Math.sin((ang + 42) * Math.PI / 180) * 15} Z
                            `} fill="black" />
                        ))}
                    </g>
                </mask>
            </defs>

            {/* Flange traseiro */}
            <ellipse cx={zT} cy={cY} rx={raioAroX} ry={raioAroY} fill="#18181b" {...ct} />

            {/* Filamento */}
            <path d={`M ${zT} ${cY - rY} L ${zF - esp} ${cY - rY} A ${rX} ${rY} 0 0 1 ${zF - esp} ${cY + rY} L ${zT} ${cY + rY} A ${rX} ${rY} 0 0 1 ${zT} ${cY - rY}`} fill={`url(#cf-${id})`} {...ct} />
            <ellipse cx={zF - esp} cy={cY} rx={rX} ry={rY} fill={`url(#cf-${id})`} {...ct} />

            {/* Núcleo */}
            <ellipse cx={zF} cy={cY} rx={raioNucleoX} ry={raioNucleoY} fill={`url(#cp-${id})`} />

            {/* Espessura flange frontal */}
            <path d={`M ${zF - esp} ${cY - raioAroY} L ${zF} ${cY - raioAroY} A ${raioAroX} ${raioAroY} 0 1 1 ${zF} ${cY + raioAroY} L ${zF - esp} ${cY + raioAroY} A ${raioAroX} ${raioAroY} 0 1 0 ${zF - esp} ${cY - raioAroY}`} fill={`url(#ca-${id})`} {...ct} />

            {/* Face frontal com recortes */}
            <ellipse cx={zF} cy={cY} rx={raioAroX} ry={raioAroY} fill={`url(#cp-${id})`} mask={`url(#cmv-${id})`} {...ct} />
            <ellipse cx={zF} cy={cY} rx={raioAroX - 1} ry={raioAroY - 1} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" mask={`url(#cmv-${id})`} />
            <ellipse cx={zF} cy={cY} rx={raioNucleoX} ry={raioNucleoY} fill={`url(#cp-${id})`} />
            <ellipse cx={zF} cy={cY} rx={raioNucleoX * 0.4} ry={raioNucleoY * 0.4} fill="#0c0c0e" />
        </svg>
    );
}

// ─── Garrafa de Resina (SLA/MSLA) ────────────────────────────────────────────
/**
 * Visualização de garrafa de resina SLA/MSLA em SVG.
 * O nível de líquido é proporcional à `porcentagem`.
 */
export function GarrafaResina({ cor = '#3b82f6', porcentagem = 100, tamanho = 64, id }: PropsMaterial) {
    const { base, claro, escuro } = useMemo(() => gerarCores(cor), [cor]);
    const pct = Math.max(2, Math.min(100, porcentagem));

    const bH = 80, bW = 46, bRx = 4, bX = 27, bY = 15;
    const liqH = (bH * 0.9) * (pct / 100);
    const liqY = (bY + bH) - liqH;

    return (
        <svg viewBox="0 0 100 100" style={{ width: tamanho, height: tamanho }} overflow="visible">
            <defs>
                <linearGradient id={`rl-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={claro} stopOpacity="0.9" />
                    <stop offset="50%" stopColor={base} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={escuro} stopOpacity="0.95" />
                </linearGradient>
                <mask id={`rmb-${id}`}>
                    <path d={`M ${bX} ${bY} h ${bW} v ${bH - bRx} a ${bRx} ${bRx} 0 0 1 -${bRx} ${bRx} h -${bW - bRx * 2} a ${bRx} ${bRx} 0 0 1 -${bRx} -${bRx} z`} fill="white" />
                </mask>
            </defs>

            {/* Tampa */}
            <rect x="36" y="5" width="28" height="12" rx="2" fill="#18181b" stroke="#3f3f46" strokeWidth="0.5" />

            {/* Corpo */}
            <path
                d={`M ${bX} ${bY} h ${bW} v ${bH - bRx} a ${bRx} ${bRx} 0 0 1 -${bRx} ${bRx} h -${bW - bRx * 2} a ${bRx} ${bRx} 0 0 1 -${bRx} -${bRx} z`}
                fill="rgba(9,9,11,0.5)" stroke="rgba(255,255,255,0.12)" strokeWidth="1"
            />

            {/* Líquido */}
            <g mask={`url(#rmb-${id})`}>
                <rect x={bX} y={liqY} width={bW} height={liqH} fill={`url(#rl-${id})`} />
                <ellipse cx={50} cy={liqY} rx={bW / 2} ry={3.5} fill={claro} opacity={0.45} />
            </g>

            {/* Rótulo decorativo */}
            <rect x={bX + 9} y={bY + 18} width={bW - 18} height={28} rx="2" fill="rgba(255,255,255,0.04)" />
        </svg>
    );
}
