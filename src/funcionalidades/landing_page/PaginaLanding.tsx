import { Header } from './componentes/Header';
import { Hero } from './componentes/Hero';
import { CalculadoraCusto } from './componentes/CalculadoraCusto';
import { Beneficios } from './componentes/Beneficios';

import { Rodape } from './componentes/Rodape';

export function PaginaLanding() {
    return (
        <div className="min-h-screen bg-[#050505] font-sans text-white selection:bg-[#0ea5e9] selection:text-white overflow-x-hidden">
            <Header />
            <Hero />
            <CalculadoraCusto />
            <Beneficios />
            <Rodape />
        </div>
    );
}
