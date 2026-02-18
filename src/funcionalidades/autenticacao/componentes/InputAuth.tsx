import { ComponentProps, useState, ElementType, ReactNode } from 'react';

interface PropsInputAuth extends ComponentProps<'input'> {
    label: string;
    icone: ElementType;
    labelDireita?: ReactNode;
}

export function InputAuth({ label, icone: Icone, labelDireita, ...props }: PropsInputAuth) {
    const [focou, definirFocou] = useState(false);

    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{label}</label>
                {labelDireita}
            </div>
            <div className={`
                group flex items-center border rounded-xl px-3 py-3.5 transition-all duration-300
                ${focou
                    ? 'bg-zinc-900/80 border-[#0ea5e9] shadow-[0_0_15px_-5px_rgba(14,165,233,0.3)]'
                    : 'bg-zinc-900/40 border-white/5 hover:border-white/10 hover:bg-zinc-900/60'}
            `}>
                <Icone size={18} className={`mr-3 transition-colors ${focou ? 'text-[#0ea5e9]' : 'text-zinc-600 group-hover:text-zinc-500'}`} />
                <input
                    {...props}
                    onFocus={(e) => {
                        definirFocou(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        definirFocou(false);
                        props.onBlur?.(e);
                    }}
                    className="flex-1 bg-transparent outline-none text-zinc-200 placeholder-zinc-700 text-sm font-medium transition-colors"
                />
            </div>
        </div>
    );
}
