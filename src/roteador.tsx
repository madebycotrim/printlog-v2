import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/compartilhado/componentes_ui/Layout';

// Páginas Públicas
import { PaginaLanding } from '@/funcionalidades/landing_page/PaginaLanding';
import { SegurancaPrivacidade } from '@/funcionalidades/landing_page/SegurancaPrivacidade';
import { PoliticaPrivacidade } from '@/funcionalidades/landing_page/PoliticaPrivacidade';
import { TermosUso } from '@/funcionalidades/landing_page/TermosUso';

// Autenticação
import { PaginaAcesso } from '@/funcionalidades/autenticacao/PaginaAcesso';
import { PaginaCadastro } from '@/funcionalidades/autenticacao/PaginaCadastro';
import { PaginaRecuperacaoSenha } from '@/funcionalidades/autenticacao/PaginaRecuperacaoSenha';
import { ProvedorAutenticacao } from '@/funcionalidades/autenticacao/contexto/ContextoAutenticacao';
import { RotaProtegida } from '@/compartilhado/infraestrutura/roteamento/RotaProtegida';

// Páginas da Aplicação (Organizadas por Categoria)
// 1. Geral
import { PaginaInicial } from '@/funcionalidades/geral/painel/PaginaInicial';
import { PaginaCalculadora } from '@/funcionalidades/geral/calculadora/pagina';

// 2. Produção
import { PaginaProjetos } from '@/funcionalidades/producao/projetos/pagina';
import { PaginaImpressoras } from '@/funcionalidades/producao/impressoras/pagina';
import { PaginaFilamentos } from '@/funcionalidades/producao/filamentos/pagina';
import { PaginaInsumos } from '@/funcionalidades/producao/insumos/pagina';

// 3. Comercial
import { PaginaClientes } from '@/funcionalidades/comercial/clientes/pagina';
import { PaginaFinanceiro } from '@/funcionalidades/comercial/financeiro/pagina';

// 4. Sistema
import { PaginaConfiguracoes } from '@/funcionalidades/sistema/configuracoes/PaginaConfiguracoes';
import { PaginaAjuda } from '@/funcionalidades/sistema/ajuda/pagina';

export function RoteadorPrincipal() {
    return (
        <ProvedorAutenticacao>
            <BrowserRouter>
                <Routes>
                    {/* Landing Page Pública */}
                    <Route path="/" element={<PaginaLanding />} />
                    <Route path="/seguranca-e-privacidade" element={<SegurancaPrivacidade />} />
                    <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
                    <Route path="/termos-de-uso" element={<TermosUso />} />

                    {/* Autenticação */}
                    <Route path="/login" element={<PaginaAcesso />} />
                    <Route path="/cadastro" element={<PaginaCadastro />} />
                    <Route path="/recuperar-senha" element={<PaginaRecuperacaoSenha />} />

                    {/* Aplicação Interna Protegida */}

                    {/* 1. GERAL */}
                    <Route path="/dashboard" element={<RotaProtegida><Layout><PaginaInicial /></Layout></RotaProtegida>} />
                    <Route path="/calculadora" element={<RotaProtegida><Layout><PaginaCalculadora /></Layout></RotaProtegida>} />

                    {/* 2. PRODUÇÃO */}
                    <Route path="/projetos" element={<RotaProtegida><Layout><PaginaProjetos /></Layout></RotaProtegida>} />
                    <Route path="/impressoras" element={<RotaProtegida><Layout><PaginaImpressoras /></Layout></RotaProtegida>} />
                    <Route path="/materiais" element={<RotaProtegida><Layout><PaginaFilamentos /></Layout></RotaProtegida>} />
                    <Route path="/insumos" element={<RotaProtegida><Layout><PaginaInsumos /></Layout></RotaProtegida>} />

                    {/* 3. COMERCIAL */}
                    <Route path="/clientes" element={<RotaProtegida><Layout><PaginaClientes /></Layout></RotaProtegida>} />
                    <Route path="/financeiro" element={<RotaProtegida><Layout><PaginaFinanceiro /></Layout></RotaProtegida>} />

                    {/* 4. SISTEMA */}
                    <Route path="/configuracoes" element={<RotaProtegida><Layout><PaginaConfiguracoes /></Layout></RotaProtegida>} />
                    <Route path="/central-maker" element={<RotaProtegida><Layout><PaginaAjuda /></Layout></RotaProtegida>} />
                </Routes>
            </BrowserRouter>
        </ProvedorAutenticacao>
    );
}
