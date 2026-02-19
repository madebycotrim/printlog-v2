import { ReactNode, useState } from 'react';
import { BarraLateral } from './BarraLateral';
import { Cabecalho } from './Cabecalho';
import { ProvedorCabecalho } from '@/compartilhado/contextos/ContextoCabecalho';

type PropriedadesLayout = {
    children: ReactNode;
};

export function Layout({ children }: PropriedadesLayout) {
    const [sidebarAberta, definirSidebarAberta] = useState(false);

    return (
        <ProvedorCabecalho>
            <div className="flex h-screen bg-zinc-100 dark:bg-[#09090b] font-sans text-zinc-900 dark:text-gray-100 transition-colors duration-300 relative">
                {/* Sidebar Fixa (Desktop) / Drawer (Mobile) */}
                <BarraLateral
                    abertaMobile={sidebarAberta}
                    aoFechar={() => definirSidebarAberta(false)}
                />

                {/* Área Principal */}
                <div className="flex-1 flex flex-col min-w-0 md:ml-0 transition-all duration-300 relative">

                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_55%_60%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]"></div>
                    </div>

                    <Cabecalho aoAbrirBarraLateral={() => definirSidebarAberta(true)} />

                    <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-2">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </ProvedorCabecalho>
    );
}
