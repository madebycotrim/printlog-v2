import { useEffect, useRef, useState } from 'react';

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface Resultado {
    custoMaterial: number;
    custoEnergia: number;
    custoMaoDeObra: number;
    custoTotal: number;
    precoSugerido: number;
    lucro: number;
    margemLucro: number;
}

/* ─── Slider ─────────────────────────────────────────────────────────────── */
function Slider({
    label, value, min, max, step, unit, color, onChange,
}: {
    label: string; value: number; min: number; max: number; step: number;
    unit: string; color: string; onChange: (v: number) => void;
}) {
    const pct = ((value - min) / (max - min)) * 100;
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400 font-medium">{label}</span>
                <span className="text-xs font-bold font-mono" style={{ color }}>{value}{unit}</span>
            </div>
            <div className="relative h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,.07)' }}>
                <div
                    className="absolute left-0 top-0 h-full rounded-full transition-all duration-150"
                    style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}80` }}
                />
                <input
                    type="range" min={min} max={max} step={step} value={value}
                    onChange={e => onChange(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg pointer-events-none transition-all duration-150"
                    style={{ left: `calc(${pct}% - 7px)`, background: color, boxShadow: `0 0 10px ${color}` }}
                />
            </div>
        </div>
    );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export function CalculadoraCusto() {
    const sectionRef = useRef<HTMLElement>(null);
    const [visible, setVisible] = useState(false);

    // Inputs
    const [peso, setPeso] = useState(120);           // gramas
    const [horas, setHoras] = useState(8);           // horas de impressão
    const [precoPorKg, setPrecoPorKg] = useState(80); // R$/kg
    const [margem, setMargem] = useState(40);        // % margem
    const [kwh, setKwh] = useState(0.75);            // R$/kWh
    const [potencia, setPotencia] = useState(200);   // Watts

    // Resultado calculado
    const [resultado, setResultado] = useState<Resultado | null>(null);

    useEffect(() => {
        const custoMaterial = (peso / 1000) * precoPorKg;
        const custoEnergia = (potencia / 1000) * horas * kwh;
        const custoMaoDeObra = horas * 2.5; // R$2,50/h base
        const custoTotal = custoMaterial + custoEnergia + custoMaoDeObra;
        const precoSugerido = custoTotal * (1 + margem / 100);
        const lucro = precoSugerido - custoTotal;
        const margemLucro = (lucro / precoSugerido) * 100;
        setResultado({ custoMaterial, custoEnergia, custoMaoDeObra, custoTotal, precoSugerido, lucro, margemLucro });
    }, [peso, horas, precoPorKg, margem, kwh, potencia]);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) setVisible(true); },
            { threshold: 0.15 }
        );
        if (sectionRef.current) obs.observe(sectionRef.current);
        return () => obs.disconnect();
    }, []);

    const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const breakdown = resultado ? [
        { label: 'Material', value: resultado.custoMaterial, color: '#f97316', icon: '🧵' },
        { label: 'Energia', value: resultado.custoEnergia, color: '#0ea5e9', icon: '⚡' },
        { label: 'Mão de Obra', value: resultado.custoMaoDeObra, color: '#a78bfa', icon: '⏱' },
    ] : [];

    return (
        <>
            <style>{`
                @keyframes calcFadeUp {
                    from { opacity:0; transform:translateY(28px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                @keyframes calcGlow {
                    0%,100% { opacity:.4; transform:scale(1); }
                    50%      { opacity:.8; transform:scale(1.06); }
                }
                @keyframes calcBarFill {
                    from { width: 0%; }
                }
            `}</style>

            <section
                id="calculadora"
                ref={sectionRef}
                className="relative py-28 overflow-hidden"
                style={{ background: '#050507' }}
            >
                {/* ── Background glows ── */}
                <div className="absolute pointer-events-none" style={{ top: '10%', left: '5%', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(14,165,233,.08) 0%, transparent 70%)', animation: 'calcGlow 8s ease-in-out infinite' }} />
                <div className="absolute pointer-events-none" style={{ bottom: '10%', right: '5%', width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(99,102,241,.07) 0%, transparent 70%)', animation: 'calcGlow 10s ease-in-out infinite 2s' }} />

                {/* ── Separator line ── */}
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.06), transparent)' }} />

                <div className="container mx-auto px-6 relative z-10">

                    {/* ── Section Header ── */}
                    <div
                        className="text-center mb-16"
                        style={{ animation: visible ? 'calcFadeUp .7s ease both' : 'none', opacity: 0 }}
                    >
                        <div
                            className="inline-flex items-center gap-2.5 px-4 py-2 mb-6 rounded-full border"
                            style={{ background: 'rgba(14,165,233,.08)', borderColor: 'rgba(14,165,233,.2)' }}
                        >
                            <span className="text-sky-400 text-[11px] font-bold tracking-[.2em] uppercase font-mono">Calculadora de Custos</span>
                        </div>
                        <h2
                            className="font-black uppercase tracking-tighter leading-none text-white mb-4"
                            style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)' }}
                        >
                            Precifique com{' '}
                            <span style={{
                                background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}>
                                Precisão
                            </span>
                        </h2>
                        <p className="text-zinc-500 text-base max-w-xl mx-auto leading-relaxed">
                            Simule o custo real de qualquer impressão e descubra o preço ideal para garantir lucro.
                        </p>
                    </div>

                    {/* ── Main Grid ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">

                        {/* ── LEFT: Inputs ── */}
                        <div
                            className="rounded-3xl p-7 space-y-6"
                            style={{
                                background: 'linear-gradient(145deg, #0e0e12, #0a0a0d)',
                                border: '1px solid rgba(255,255,255,.07)',
                                boxShadow: '0 32px 80px -12px rgba(0,0,0,.8)',
                                animation: visible ? 'calcFadeUp .7s .1s ease both' : 'none',
                                opacity: 0,
                            }}
                        >
                            <div className="flex items-center gap-3 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: 'rgba(14,165,233,.1)', border: '1px solid rgba(14,165,233,.2)' }}>⚙️</div>
                                <div>
                                    <div className="text-white font-bold text-sm">Parâmetros da Impressão</div>
                                    <div className="text-zinc-600 text-xs">Ajuste os valores para sua peça</div>
                                </div>
                            </div>

                            <Slider label="Peso do filamento" value={peso} min={10} max={500} step={5} unit="g" color="#f97316" onChange={setPeso} />
                            <Slider label="Tempo de impressão" value={horas} min={0.5} max={48} step={0.5} unit="h" color="#0ea5e9" onChange={setHoras} />
                            <Slider label="Preço do filamento" value={precoPorKg} min={40} max={300} step={5} unit=" R$/kg" color="#a78bfa" onChange={setPrecoPorKg} />
                            <Slider label="Potência da impressora" value={potencia} min={50} max={500} step={10} unit="W" color="#34d399" onChange={setPotencia} />
                            <Slider label="Custo da energia" value={kwh} min={0.3} max={2} step={0.05} unit=" R$/kWh" color="#fbbf24" onChange={setKwh} />
                            <Slider label="Margem de lucro desejada" value={margem} min={5} max={200} step={5} unit="%" color="#f43f5e" onChange={setMargem} />
                        </div>

                        {/* ── RIGHT: Results ── */}
                        <div
                            className="flex flex-col gap-5"
                            style={{ animation: visible ? 'calcFadeUp .7s .2s ease both' : 'none', opacity: 0 }}
                        >
                            {/* Price card */}
                            <div
                                className="rounded-3xl p-7"
                                style={{
                                    background: 'linear-gradient(145deg, #0e0e12, #0a0a0d)',
                                    border: '1px solid rgba(255,255,255,.07)',
                                    boxShadow: '0 32px 80px -12px rgba(0,0,0,.8)',
                                }}
                            >
                                <div className="flex justify-between items-start mb-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                                    <div>
                                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Preço Sugerido</div>
                                        <div className="text-4xl font-black font-mono tracking-tighter text-white">
                                            {resultado ? fmt(resultado.precoSugerido) : '—'}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Lucro</div>
                                        <div className="text-2xl font-black font-mono text-emerald-400">
                                            {resultado ? fmt(resultado.lucro) : '—'}
                                        </div>
                                    </div>
                                </div>

                                {/* Breakdown */}
                                <div className="space-y-3 mb-5">
                                    {breakdown.map(item => (
                                        <div key={item.label} className="flex justify-between items-center p-3 rounded-xl" style={{ background: `${item.color}0d`, border: `1px solid ${item.color}20` }}>
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-base">{item.icon}</span>
                                                <span className="text-sm text-zinc-300 font-medium">{item.label}</span>
                                            </div>
                                            <span className="font-mono font-bold text-sm" style={{ color: item.color }}>{fmt(item.value)}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Margin bar */}
                                {resultado && (
                                    <div className="p-4 rounded-2xl" style={{ background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.15)' }}>
                                        <div className="flex justify-between items-center mb-2.5">
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Margem Real</span>
                                            <span className="text-emerald-400 font-black font-mono text-lg">{resultado.margemLucro.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: 'rgba(255,255,255,.06)' }}>
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${Math.min(resultado.margemLucro, 100)}%`,
                                                    background: 'linear-gradient(90deg, #10b981, #34d399)',
                                                    boxShadow: '0 0 12px rgba(16,185,129,.5)',
                                                    transition: 'width .6s ease',
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* CTA card */}
                            <div
                                className="rounded-3xl p-6 flex items-center justify-between gap-4"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(14,165,233,.1), rgba(99,102,241,.08))',
                                    border: '1px solid rgba(14,165,233,.15)',
                                }}
                            >
                                <div>
                                    <div className="text-white font-bold text-sm mb-1">Quer calcular de verdade?</div>
                                    <div className="text-zinc-500 text-xs">Importe seu G-code e calcule automaticamente.</div>
                                </div>
                                <button
                                    onClick={() => window.location.href = '/cadastro'}
                                    className="shrink-0 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide text-white transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
                                    style={{ background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', boxShadow: '0 0 24px -6px rgba(14,165,233,.5)' }}
                                >
                                    Começar Grátis
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
