import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './compartilhado/componentes_ui/Layout';
import { PaginaInicial } from './funcionalidades/painel/PaginaInicial';
import { PaginaFilamentos } from './funcionalidades/filamentos/pagina';
import { PaginaImpressoras } from './funcionalidades/impressoras/pagina';
import { PaginaProjetos } from './funcionalidades/projetos/pagina';
import { PaginaClientes } from './funcionalidades/clientes/pagina';
import { PaginaFinanceiro } from './funcionalidades/financeiro/pagina';
import { PaginaLanding } from './funcionalidades/landing_page/PaginaLanding';
import { SegurancaPrivacidade } from './funcionalidades/landing_page/SegurancaPrivacidade';
import { PoliticaPrivacidade } from './funcionalidades/landing_page/PoliticaPrivacidade';
import { TermosUso } from './funcionalidades/landing_page/TermosUso';

import { PaginaLogin } from './funcionalidades/autenticacao/PaginaLogin';
import { PaginaCadastro } from './funcionalidades/autenticacao/PaginaCadastro';

export function RoteadorPrincipal() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Landing Page Pública */}
                <Route path="/" element={<PaginaLanding />} />
                <Route path="/seguranca-privacidade" element={<SegurancaPrivacidade />} />
                <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
                <Route path="/termos-uso" element={<TermosUso />} />
                <Route path="/login" element={<PaginaLogin />} />
                <Route path="/cadastro" element={<PaginaCadastro />} />

                {/* Aplicação Interna */}
                <Route path="/app" element={<Layout><PaginaInicial /></Layout>} />
                <Route path="/filamentos" element={<Layout><PaginaFilamentos /></Layout>} />
                <Route path="/impressoras" element={<Layout><PaginaImpressoras /></Layout>} />
                <Route path="/projetos" element={<Layout><PaginaProjetos /></Layout>} />
                <Route path="/clientes" element={<Layout><PaginaClientes /></Layout>} />
                <Route path="/financeiro" element={<Layout><PaginaFinanceiro /></Layout>} />
            </Routes>
        </BrowserRouter>
    );
}
