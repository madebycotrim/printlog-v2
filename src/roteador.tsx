import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/compartilhado/componentes_ui/Layout";
import { RotaProtegida } from "@/compartilhado/infraestrutura/roteamento/RotaProtegida";
import { ProvedorAutenticacao } from "@/funcionalidades/autenticacao/contexto/ContextoAutenticacao";

// --- COMPONENTES ESTÃTICOS ESSENCIAIS ---
// Esses nÃ£o devem usar lazy loading pois sÃ£o a base da navegaÃ§Ã£o/seguranÃ§a

// --- PÃGINAS COM LAZY LOADING (CODE SPLITTING) ---
// O carregamento inicial baixa apenas o Layout e AutenticaÃ§Ã£o.
// As pÃ¡ginas sÃ£o baixadas apenas sob demanda quando acessadas.

// Landing Page PÃºblica
const PaginaLanding = lazy(() =>
  import("@/funcionalidades/landing_page/PaginaLanding").then((m) => ({
    default: m.PaginaLanding,
  })),
);
const SegurancaPrivacidade = lazy(() =>
  import("@/funcionalidades/landing_page/SegurancaPrivacidade").then((m) => ({
    default: m.SegurancaPrivacidade,
  })),
);
const PoliticaPrivacidade = lazy(() =>
  import("@/funcionalidades/landing_page/PoliticaPrivacidade").then((m) => ({
    default: m.PoliticaPrivacidade,
  })),
);
const TermosUso = lazy(() =>
  import("@/funcionalidades/landing_page/TermosUso").then((m) => ({
    default: m.TermosUso,
  })),
);

// AutenticaÃ§Ã£o
const PaginaAcesso = lazy(() =>
  import("@/funcionalidades/autenticacao/PaginaAcesso").then((m) => ({
    default: m.PaginaAcesso,
  })),
);
const PaginaCadastro = lazy(() =>
  import("@/funcionalidades/autenticacao/PaginaCadastro").then((m) => ({
    default: m.PaginaCadastro,
  })),
);
const PaginaRecuperacaoSenha = lazy(() =>
  import("@/funcionalidades/autenticacao/PaginaRecuperacaoSenha").then((m) => ({
    default: m.PaginaRecuperacaoSenha,
  })),
);

// 1. Geral
const PaginaInicial = lazy(() =>
  import("@/funcionalidades/geral/painel/PaginaInicial").then((m) => ({
    default: m.PaginaInicial,
  })),
);
const PaginaCalculadora = lazy(() =>
  import("@/funcionalidades/geral/calculadora/pagina").then((m) => ({
    default: m.PaginaCalculadora,
  })),
);

// 2. ProduÃ§Ã£o
const PaginaProjetos = lazy(() =>
  import("@/funcionalidades/producao/projetos/pagina").then((m) => ({
    default: m.PaginaProjetos,
  })),
);
const PaginaImpressoras = lazy(() =>
  import("@/funcionalidades/producao/impressoras/pagina").then((m) => ({
    default: m.PaginaImpressoras,
  })),
);
const PaginaMateriais = lazy(() =>
  import("@/funcionalidades/producao/materiais/pagina").then((m) => ({
    default: m.PaginaMateriais,
  })),
);
const PaginaInsumos = lazy(() =>
  import("@/funcionalidades/producao/insumos/pagina").then((m) => ({
    default: m.PaginaInsumos,
  })),
);

// 3. Comercial
const PaginaClientes = lazy(() =>
  import("@/funcionalidades/comercial/clientes/pagina").then((m) => ({
    default: m.PaginaClientes,
  })),
);
const PaginaFinanceiro = lazy(() =>
  import("@/funcionalidades/comercial/financeiro/pagina").then((m) => ({
    default: m.PaginaFinanceiro,
  })),
);

// 4. Sistema
const PaginaConfiguracoes = lazy(() =>
  import("@/funcionalidades/sistema/configuracoes/pagina").then(
    (m) => ({ default: m.PaginaConfiguracoes }),
  ),
);
const PaginaAjuda = lazy(() =>
  import("@/funcionalidades/sistema/ajuda/pagina").then((m) => ({
    default: m.PaginaAjuda,
  })),
);

// Fallback de Carregamento Global
const FallbackCarregamento = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0e0e11]">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-500"></div>
  </div>
);

export function RoteadorPrincipal() {
  return (
    <ProvedorAutenticacao>
      <BrowserRouter>
        <Suspense fallback={<FallbackCarregamento />}>
          <Routes>
            {/* Landing Page PÃºblica */}
            <Route path="/" element={<PaginaLanding />} />
            <Route
              path="/seguranca-e-privacidade"
              element={<SegurancaPrivacidade />}
            />
            <Route
              path="/politica-de-privacidade"
              element={<PoliticaPrivacidade />}
            />
            <Route path="/termos-de-uso" element={<TermosUso />} />

            {/* AutenticaÃ§Ã£o */}
            <Route path="/login" element={<PaginaAcesso />} />
            <Route path="/cadastro" element={<PaginaCadastro />} />
            <Route
              path="/recuperar-senha"
              element={<PaginaRecuperacaoSenha />}
            />

            {/* AplicaÃ§Ã£o Interna Protegida */}
            {/* 1. GERAL */}
            <Route
              path="/dashboard"
              element={
                <RotaProtegida>
                  <Layout>
                    <PaginaInicial />
                  </Layout>
                </RotaProtegida>
              }
            />
            <Route
              path="/calculadora"
              element={
                <RotaProtegida>
                  <Layout>
                    <PaginaCalculadora />
                  </Layout>
                </RotaProtegida>
              }
            />

            {/* 2. PRODUÃ‡ÃƒO */}
            <Route
              path="/projetos"
              element={
                <RotaProtegida>
                  <Layout>
                    <PaginaProjetos />
                  </Layout>
                </RotaProtegida>
              }
            />
            <Route
              path="/impressoras"
              element={
                <RotaProtegida>
                  <Layout>
                    <PaginaImpressoras />
                  </Layout>
                </RotaProtegida>
              }
            />
            <Route
              path="/materiais"
              element={
                <RotaProtegida>
                  <Layout>
                    <PaginaMateriais />
                  </Layout>
                </RotaProtegida>
              }
            />
            <Route
              path="/insumos"
              element={
                <RotaProtegida>
                  <Layout>
                    <PaginaInsumos />
                  </Layout>
                </RotaProtegida>
              }
            />

            {/* 3. COMERCIAL */}
            <Route
              path="/clientes"
              element={
                <RotaProtegida>
                  <Layout>
                    <PaginaClientes />
                  </Layout>
                </RotaProtegida>
              }
            />
            <Route
              path="/financeiro"
              element={
                <RotaProtegida>
                  <Layout>
                    <PaginaFinanceiro />
                  </Layout>
                </RotaProtegida>
              }
            />

            {/* 4. SISTEMA */}
            <Route
              path="/configuracoes"
              element={
                <RotaProtegida>
                  <Layout>
                    <PaginaConfiguracoes />
                  </Layout>
                </RotaProtegida>
              }
            />
            <Route
              path="/central-maker"
              element={
                <RotaProtegida>
                  <Layout>
                    <PaginaAjuda />
                  </Layout>
                </RotaProtegida>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ProvedorAutenticacao>
  );
}
