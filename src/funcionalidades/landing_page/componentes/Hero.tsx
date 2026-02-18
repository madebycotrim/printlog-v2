import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

/* ─── Types ────────────────────────────────────────────────────────────── */
interface Line { d: string; x1: number; y1: number; x2: number; y2: number; color: string; }




/* ─── Floating Badge (forwardRef so parent can measure its DOM position) ── */
const FloatingBadge = forwardRef<HTMLDivElement, {
    children: React.ReactNode;
    delay?: string;
    className?: string;
    style?: React.CSSProperties;
}>(({ children, delay = '0s', className = '', style }, ref) => (
    <div
        ref={ref}
        className={`absolute bg-[#0c0c0e]/90 backdrop-blur-xl border border-white/8 rounded-2xl shadow-2xl ${className}`}
        style={{ animation: `heroFloat 5s ease-in-out infinite`, animationDelay: delay, ...style }}
    >
        {children}
    </div>
));
FloatingBadge.displayName = 'FloatingBadge';

/* ─── Helper: get rect relative to a parent element ───────────────────── */
function relRect(el: HTMLElement, parent: HTMLElement) {
    const er = el.getBoundingClientRect();
    const pr = parent.getBoundingClientRect();
    return {
        left: er.left - pr.left,
        top: er.top - pr.top,
        right: er.right - pr.left,
        bottom: er.bottom - pr.top,
        width: er.width,
        height: er.height,
        cx: er.left - pr.left + er.width / 2,
        cy: er.top - pr.top + er.height / 2,
    };
}

/* ─── Main Hero ────────────────────────────────────────────────────────── */
export function Hero() {
    const [visible, setVisible] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [tick, setTick] = useState(0);
    const [lines, setLines] = useState<Line[]>([]);

    // Refs for dynamic line measurement
    const wrapperRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const badge1Ref = useRef<HTMLDivElement>(null); // Lucro Garantido (left)
    const badge2Ref = useRef<HTMLDivElement>(null); // Rolo no Fim (right-bottom)
    const badge3Ref = useRef<HTMLDivElement>(null); // Sugestão IA (right-top)

    const computeLines = useCallback(() => {
        const w = wrapperRef.current;
        const c = cardRef.current;
        const b1 = badge1Ref.current;
        const b2 = badge2Ref.current;
        const b3 = badge3Ref.current;
        if (!w || !c) return;

        const card = relRect(c, w);
        const result: Line[] = [];

        // Badge 1 — Lucro Garantido (left side) → left edge of card
        if (b1) {
            const b = relRect(b1, w);
            // Connect right edge of badge to left edge of card, at badge vertical center
            const x1 = b.right;
            const y1 = b.cy;
            const x2 = card.left;
            const y2 = card.top + card.height * 0.25;
            const cx1 = x1 + (x2 - x1) * 0.5;
            const cy1 = y1;
            const cx2 = x2 - (x2 - x1) * 0.3;
            const cy2 = y2;
            result.push({
                d: `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`,
                x1, y1, x2, y2,
                color: 'rgba(16,185,129,0.55)',
            });
        }

        // Badge 2 — Rolo no Fim (right side, bottom) → right edge of card
        if (b2) {
            const b = relRect(b2, w);
            const x1 = b.left;
            const y1 = b.cy;
            const x2 = card.right;
            const y2 = card.top + card.height * 0.78;
            const cx1 = x1 - (x1 - x2) * 0.5;
            const cy1 = y1;
            const cx2 = x2 + (x1 - x2) * 0.3;
            const cy2 = y2;
            result.push({
                d: `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`,
                x1, y1, x2, y2,
                color: 'rgba(244,63,94,0.55)',
            });
        }

        // Badge 3 — Sugestão IA (right side, top) → right edge of card
        if (b3) {
            const b = relRect(b3, w);
            const x1 = b.left;
            const y1 = b.cy;
            const x2 = card.right;
            const y2 = card.top + card.height * 0.18;
            const cx1 = x1 - (x1 - x2) * 0.5;
            const cy1 = y1;
            const cx2 = x2 + (x1 - x2) * 0.3;
            const cy2 = y2;
            result.push({
                d: `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`,
                x1, y1, x2, y2,
                color: 'rgba(99,102,241,0.55)',
            });
        }

        setLines(result);
    }, []);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 80);
        const onScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', onScroll, { passive: true });
        const interval = setInterval(() => setTick(p => p + 1), 3200);

        // Measure after paint
        const raf = requestAnimationFrame(() => {
            setTimeout(computeLines, 200);
        });

        // Re-measure on resize
        const ro = new ResizeObserver(computeLines);
        if (wrapperRef.current) ro.observe(wrapperRef.current);

        return () => {
            clearTimeout(t);
            window.removeEventListener('scroll', onScroll);
            clearInterval(interval);
            cancelAnimationFrame(raf);
            ro.disconnect();
        };
    }, [computeLines]);

    const prices = ['R$ 38,50', 'R$ 42,00', 'R$ 35,90', 'R$ 51,20'];
    const currentPrice = prices[tick % prices.length];

    return (
        <>
            {/* ── Styles ── */}
            <style>{`
                @keyframes heroFloat {
                    0%,100% { transform: translateY(0px) rotate(0deg); }
                    50%      { transform: translateY(-10px) rotate(0.5deg); }
                }
                @keyframes heroGlow {
                    0%,100% { opacity: .5; transform: scale(1); }
                    50%      { opacity: 1;  transform: scale(1.08); }
                }
                @keyframes heroPulse {
                    0%,100% { box-shadow: 0 0 0 0 rgba(14,165,233,.4); }
                    50%      { box-shadow: 0 0 0 12px rgba(14,165,233,0); }
                }
                @keyframes heroScan {
                    0%   { transform: translateY(-100%); }
                    100% { transform: translateY(400%); }
                }
                @keyframes heroShimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position:  200% center; }
                }
                @keyframes heroFadeUp {
                    from { opacity:0; transform:translateY(24px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                @keyframes heroSlideRight {
                    from { opacity:0; transform:translateX(-24px); }
                    to   { opacity:1; transform:translateX(0); }
                }
                @keyframes heroSlideLeft {
                    from { opacity:0; transform:translateX(24px); }
                    to   { opacity:1; transform:translateX(0); }
                }
                @keyframes heroPriceFlip {
                    0%   { opacity:0; transform:translateY(-12px); }
                    15%  { opacity:1; transform:translateY(0); }
                    85%  { opacity:1; transform:translateY(0); }
                    100% { opacity:0; transform:translateY(12px); }
                }
                @keyframes heroGridMove {
                    from { background-position: 0 0; }
                    to   { background-position: 28px 28px; }
                }
                @keyframes heroBeam {
                    0%   { transform: translateX(-100%) skewX(-15deg); opacity:0; }
                    10%  { opacity:1; }
                    90%  { opacity:1; }
                    100% { transform: translateX(400%) skewX(-15deg); opacity:0; }
                }
                @keyframes dashMarch {
                    to { stroke-dashoffset: -24; }
                }
                @keyframes heroScrollDot {
                    0%   { opacity: 1; transform: translateY(0); }
                    60%  { opacity: 0; transform: translateY(10px); }
                    61%  { opacity: 0; transform: translateY(0); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes heroLineRun {
                    0%   { transform: translateX(-50%) translateY(0);    opacity: 0; }
                    10%  { opacity: 1; }
                    80%  { opacity: 1; }
                    100% { transform: translateX(-50%) translateY(36px); opacity: 0; }
                }

                .hero-shimmer-text {
                    background: linear-gradient(90deg, #38bdf8 0%, #7dd3fc 30%, #fff 50%, #7dd3fc 70%, #38bdf8 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: heroShimmer 4s linear infinite;
                }
                .hero-card-glow {
                    box-shadow:
                        0 0 0 1px rgba(255,255,255,.06),
                        0 32px 80px -12px rgba(0,0,0,.9),
                        0 0 60px -20px rgba(14,165,233,.15);
                }
                .hero-card-glow:hover {
                    box-shadow:
                        0 0 0 1px rgba(14,165,233,.2),
                        0 40px 100px -12px rgba(0,0,0,.95),
                        0 0 80px -15px rgba(14,165,233,.3);
                }
                .conn-line {
                    fill: none;
                    stroke-width: 1.5;
                    stroke-dasharray: 5 4;
                    animation: dashMarch 1.4s linear infinite;
                }
            `}</style>

            <section
                id="hero"
                className="relative min-h-screen flex items-center pt-28 pb-24 overflow-hidden"
                style={{ background: '#050507' }}
            >
                {/* ── Animated Grid ── */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: 'linear-gradient(to right,rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,.04) 1px,transparent 1px)',
                        backgroundSize: '28px 28px',
                        animation: 'heroGridMove 8s linear infinite',
                        transform: `translateY(${scrollY * 0.4}px)`,
                    }}
                />

                {/* ── Vignette ── */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, transparent 0%, #050507 70%)' }} />
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 100%, transparent 0%, #050507 60%)' }} />

                {/* ── Glow Orbs ── */}
                <div className="absolute pointer-events-none" style={{ top: '-10%', left: '50%', transform: `translateX(-50%) translateY(${scrollY * 0.25}px)`, width: 800, height: 500, background: 'radial-gradient(ellipse, rgba(14,165,233,.18) 0%, transparent 70%)', animation: 'heroGlow 6s ease-in-out infinite' }} />
                <div className="absolute pointer-events-none" style={{ top: '20%', left: '15%', width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(99,102,241,.12) 0%, transparent 70%)', animation: 'heroGlow 8s ease-in-out infinite 2s' }} />
                <div className="absolute pointer-events-none" style={{ top: '30%', right: '10%', width: 350, height: 350, background: 'radial-gradient(ellipse, rgba(16,185,129,.1) 0%, transparent 70%)', animation: 'heroGlow 7s ease-in-out infinite 1s' }} />

                {/* ── Content ── */}
                <div className="container mx-auto px-6 z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">

                    {/* ── LEFT ── */}
                    <div className="flex flex-col items-start" style={{ animation: visible ? 'heroFadeUp .8s ease both' : 'none' }}>

                        {/* Badge */}
                        <div
                            className="inline-flex items-center gap-2.5 px-4 py-2 mb-10 rounded-full border"
                            style={{ background: 'rgba(14,165,233,.08)', borderColor: 'rgba(14,165,233,.25)', animation: visible ? 'heroSlideRight .7s .1s ease both' : 'none' }}
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400" />
                            </span>
                            <span className="text-sky-400 text-[11px] font-bold tracking-[.2em] uppercase font-mono">Beta Público Liberado</span>
                        </div>

                        {/* Headline */}
                        <h1
                            className="font-black leading-[.88] tracking-tighter mb-8 uppercase"
                            style={{ fontSize: 'clamp(3.2rem, 7vw, 5.5rem)', animation: visible ? 'heroFadeUp .8s .2s ease both' : 'none', opacity: 0 }}
                        >
                            <span className="text-white block">Transforme</span>
                            <span className="hero-shimmer-text block italic">Filamento</span>
                            <span className="text-white block">em Lucro.</span>
                        </h1>

                        {/* Sub */}
                        <p className="text-zinc-400 text-lg leading-relaxed mb-10 max-w-lg" style={{ animation: visible ? 'heroFadeUp .8s .35s ease both' : 'none', opacity: 0 }}>
                            Pare de precificar no <span className="text-white font-semibold">"chutômetro"</span>. Gestão profissional para makers e farms de impressão 3D — calcule custos reais, gerencie materiais e garanta lucro em cada peça.
                        </p>



                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto" style={{ animation: visible ? 'heroFadeUp .8s .55s ease both' : 'none', opacity: 0 }}>
                            <button
                                onClick={() => window.location.href = '/cadastro'}
                                className="group relative px-8 py-4 rounded-xl font-bold text-sm tracking-wide uppercase overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5"
                                style={{ background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', color: '#fff', animation: 'heroPulse 2.5s ease-in-out infinite', boxShadow: '0 0 40px -8px rgba(14,165,233,.6)' }}
                            >
                                <div className="absolute inset-0 w-1/3 h-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent)', animation: 'heroBeam 3s ease-in-out infinite 1s' }} />
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Começar Grátis
                                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                            </button>


                        </div>

                        {/* Trust */}
                        <div className="mt-10 flex items-center gap-3" style={{ animation: visible ? 'heroFadeUp .8s .65s ease both' : 'none', opacity: 0 }}>
                            <div className="flex -space-x-2">
                                {(['#0ea5e9', '#6366f1', '#10b981', '#f59e0b'] as const).map((c, i) => (
                                    <div key={i} className="w-7 h-7 rounded-full border-2 border-[#050507] flex items-center justify-center text-[10px] font-bold text-white" style={{ background: c, zIndex: 4 - i }}>
                                        {['M', 'A', 'R', 'K'][i]}
                                    </div>
                                ))}
                            </div>
                            <span className="text-zinc-500 text-xs">
                                <span className="text-white font-semibold">+1.200 makers</span> já usam o PrintLog
                            </span>
                        </div>
                    </div>

                    {/* ── RIGHT — Mockup ── */}
                    <div
                        ref={wrapperRef}
                        className="relative flex items-center justify-center"
                        style={{
                            animation: visible ? 'heroSlideLeft .9s .3s ease both' : 'none',
                            opacity: 0,
                            minHeight: 560,
                            padding: '60px 150px',
                            overflow: 'visible',
                        }}
                    >
                        {/* Glow behind card */}
                        <div className="absolute pointer-events-none" style={{ inset: '-40px', background: 'radial-gradient(ellipse at center, rgba(14,165,233,.12) 0%, transparent 65%)', animation: 'heroGlow 5s ease-in-out infinite' }} />

                        {/* ── Dynamic SVG connector lines ── */}
                        {lines.length > 0 && (
                            <svg
                                className="absolute pointer-events-none hidden lg:block"
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', zIndex: 15 }}
                            >
                                {lines.map((l, i) => (
                                    <g key={i}>
                                        <path
                                            className="conn-line"
                                            d={l.d}
                                            stroke={l.color}
                                            style={{ animationDelay: `${i * 0.45}s` }}
                                        />
                                        {/* Dot at badge end */}
                                        <circle cx={l.x1} cy={l.y1} r="3.5" fill={l.color} />
                                        {/* Dot at card end */}
                                        <circle cx={l.x2} cy={l.y2} r="3.5" fill={l.color} />
                                        {/* Subtle glow dot at card end */}
                                        <circle cx={l.x2} cy={l.y2} r="6" fill={l.color} opacity="0.2" />
                                    </g>
                                ))}
                            </svg>
                        )}

                        {/* ── Main Card ── */}
                        <div
                            ref={cardRef}
                            className="relative hero-card-glow rounded-3xl transition-all duration-500 hover:-translate-y-2 group"
                            style={{ background: 'linear-gradient(145deg, #0e0e12, #0a0a0d)', border: '1px solid rgba(255,255,255,.07)', width: 380, padding: '28px' }}
                        >
                            {/* Scan line */}
                            <div className="absolute left-0 right-0 h-px pointer-events-none overflow-hidden rounded-3xl" style={{ top: 0, bottom: 0 }}>
                                <div style={{ position: 'absolute', left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(14,165,233,.6), transparent)', animation: 'heroScan 4s ease-in-out infinite' }} />
                            </div>

                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                                <div>
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase">Online</span>
                                    </div>
                                    <div className="text-white font-bold text-base tracking-tight">Peça Final GCODE</div>
                                    <div className="text-zinc-500 text-xs mt-0.5">Vaso Decorativo v3.gcode</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Preço Final</div>
                                    <div key={currentPrice} className="text-3xl font-black font-mono tracking-tighter group-hover:text-sky-400 transition-colors" style={{ color: '#fff', animation: 'heroPriceFlip 3.2s ease both' }}>
                                        {currentPrice}
                                    </div>
                                </div>
                            </div>

                            {/* Cost Breakdown */}
                            <div className="space-y-3 mb-6">
                                {[
                                    { icon: '⚡', label: 'Energia', sub: '12h 45m', value: 'R$ 5,20', color: '#0ea5e9', bg: 'rgba(14,165,233,.08)', border: 'rgba(14,165,233,.15)' },
                                    { icon: '🧵', label: 'Material', sub: '112g PLA', value: 'R$ 12,80', color: '#f97316', bg: 'rgba(249,115,22,.08)', border: 'rgba(249,115,22,.15)' },
                                    { icon: '⏱', label: 'Mão de Obra', sub: '15 min setup', value: 'R$ 3,00', color: '#a78bfa', bg: 'rgba(167,139,250,.08)', border: 'rgba(167,139,250,.15)' },
                                ].map(item => (
                                    <div key={item.label} className="flex justify-between items-center p-3.5 rounded-xl transition-all duration-300 hover:-translate-x-1 cursor-default group/row" style={{ background: item.bg, border: `1px solid ${item.border}` }}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base transition-transform group-hover/row:scale-110" style={{ background: `${item.color}18`, border: `1px solid ${item.color}30` }}>
                                                {item.icon}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-zinc-200">{item.label}</div>
                                                <div className="text-xs text-zinc-500">{item.sub}</div>
                                            </div>
                                        </div>
                                        <div className="font-mono font-bold text-sm" style={{ color: item.color }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Profit Bar */}
                            <div className="p-4 rounded-2xl" style={{ background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.15)' }}>
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5">Lucro Real</div>
                                        <div className="text-2xl font-black text-emerald-400 font-mono tracking-tighter">85%</div>
                                    </div>
                                    <button className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-300 hover:scale-105" style={{ background: '#fff', color: '#000' }}>
                                        Ver Detalhes
                                    </button>
                                </div>
                                <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: 'rgba(255,255,255,.06)' }}>
                                    <div className="h-full rounded-full" style={{ width: '85%', background: 'linear-gradient(90deg, #10b981, #34d399)', boxShadow: '0 0 12px rgba(16,185,129,.5)', transition: 'width 1.5s ease' }} />
                                </div>
                            </div>
                        </div>

                        {/* ── Badge: Lucro Garantido (top-left) ── */}
                        <FloatingBadge
                            ref={badge1Ref}
                            delay="0s"
                            className="hidden lg:flex items-center gap-3 p-3.5 pr-5"
                            style={{ top: '60px', left: '-145px', zIndex: 20 }}
                        >
                            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.25)' }}>
                                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mb-0.5">Status</div>
                                <div className="text-white font-bold text-sm">Lucro Garantido</div>
                            </div>
                        </FloatingBadge>

                        {/* ── Badge: Rolo no Fim (bottom-right) ── */}
                        <FloatingBadge
                            ref={badge2Ref}
                            delay="2s"
                            className="hidden lg:block p-4"
                            style={{ bottom: '60px', right: '-145px', width: 230, zIndex: 20 }}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(244,63,94,.1)', border: '1px solid rgba(244,63,94,.2)' }}>
                                        <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Alerta</div>
                                        <div className="text-white font-bold text-sm">Rolo no Fim</div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded" style={{ color: '#fb7185', background: 'rgba(244,63,94,.12)', border: '1px solid rgba(244,63,94,.2)' }}>15%</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-zinc-400">PLA Silk Dourado</span>
                                    <span className="text-white font-mono font-bold">150g</span>
                                </div>
                                <div className="w-full rounded-full overflow-hidden" style={{ height: 5, background: 'rgba(255,255,255,.06)' }}>
                                    <div className="h-full rounded-full" style={{ width: '15%', background: '#f43f5e', boxShadow: '0 0 8px rgba(244,63,94,.5)' }} />
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                                    <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Suficiente para esta impressão (112g)
                                </div>
                            </div>
                        </FloatingBadge>

                        {/* ── Badge: AI Suggestion (top-right) ── */}
                        <FloatingBadge
                            ref={badge3Ref}
                            delay="1s"
                            className="hidden xl:flex items-center gap-2.5 px-4 py-3"
                            style={{ top: '-10px', right: '-145px', zIndex: 20 }}
                        >
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm" style={{ background: 'rgba(99,102,241,.12)', border: '1px solid rgba(99,102,241,.25)' }}>
                                ✦
                            </div>
                            <div>
                                <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mb-0.5">Sugestão IA</div>
                                <div className="text-white font-semibold text-xs">Aumente 12% o preço</div>
                            </div>
                        </FloatingBadge>
                    </div>
                </div>

                {/* ── Scroll Indicator ── */}
                <div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-end gap-3 cursor-pointer group/scroll"
                    style={{ animation: visible ? 'heroFadeUp .8s .9s ease both' : 'none', opacity: 0 }}
                    onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
                >
                    {/* Label rotated */}
                    <span
                        className="text-[9px] uppercase font-bold transition-colors duration-300 group-hover/scroll:text-sky-400"
                        style={{ color: 'rgba(255,255,255,.2)', letterSpacing: '0.3em', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                    >
                        Role para descobrir
                    </span>

                    {/* Animated vertical line */}
                    <div className="relative flex flex-col items-center" style={{ height: 64 }}>
                        {/* Track */}
                        <div className="absolute inset-x-0 top-0 bottom-0 mx-auto" style={{ width: 1, background: 'rgba(255,255,255,.07)' }} />
                        {/* Glowing runner */}
                        <div style={{ animation: 'heroLineRun 1.8s ease-in-out infinite', position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)' }}>
                            <div style={{ width: 1, height: 28, background: 'linear-gradient(180deg, transparent, #0ea5e9)' }} />
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 10px 3px rgba(14,165,233,.7)', marginLeft: -2 }} />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
