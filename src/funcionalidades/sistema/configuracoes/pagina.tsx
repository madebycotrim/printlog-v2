import { useState } from "react";
import { Save, Check, Loader2, X } from "lucide-react";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contexto/ContextoAutenticacao";

import { CardPerfil } from "./componentes/CardPerfil";
import { CardOperacional } from "./componentes/CardOperacional";
import { CardAparencia } from "./componentes/CardAparencia";
import { CardMetricas } from "./componentes/CardMetricas";
import { CardPrivacidade } from "./componentes/CardPrivacidade";

import { usarContextoTema } from "@/compartilhado/tema/tema_provider";

export function PaginaConfiguracoes() {
  const { usuario, atualizarPerfil, recuperarSenha } = usarAutenticacao();
  const themeContext = usarContextoTema();

  const [nome, definirNome] = useState(usuario?.nome || "");
  const [salvando, definirSalvando] = useState(false);
  const [sucesso, definirSucesso] = useState(false);
  const [enviandoEmail, definirEnviandoEmail] = useState(false);
  const [sucessoLink, definirSucessoLink] = useState(false);
  const [toastVisivel, definirToastVisivel] = useState(false);

  // Estados Operacionais Adicionados
  const [custoEnergia, definirCustoEnergia] = useState("R$ 0,95");
  const [horaMaquina, definirHoraMaquina] = useState("R$ 5,00");
  const [horaOperador, definirHoraOperador] = useState("R$ 20,00");
  const [margemLucro, definirMargemLucro] = useState("150,00%");

  // Estado Inicial da Aparencia para detectar mudancas
  const [inicialAparencia, definirInicialAparencia] = useState({
    modo: themeContext.modo_tema,
    cor: themeContext.cor_primaria,
    fonte: themeContext.fonte
  });

  // Detecção de Alterações Pendentes
  const perfilPendente = nome !== (usuario?.nome || "");
  const operacionalPendente =
    custoEnergia !== "R$ 0,95" ||
    horaMaquina !== "R$ 5,00" ||
    horaOperador !== "R$ 20,00" ||
    margemLucro !== "150,00%";

  const aparenciaPendente =
    themeContext.modo_tema !== inicialAparencia.modo ||
    themeContext.cor_primaria !== inicialAparencia.cor ||
    themeContext.fonte !== inicialAparencia.fonte;

  const totalAlteracoes = [perfilPendente, operacionalPendente, aparenciaPendente].filter(Boolean).length;
  const temAlteracoes = totalAlteracoes > 0;

  const lidarComTrocaSenha = async () => {
    if (!usuario?.email) return;
    definirEnviandoEmail(true);
    definirSucessoLink(false);
    try {
      await recuperarSenha(usuario.email);
      definirSucessoLink(true);
      // O link de sucesso sumira apos 8 segundos para voltar o botao
      setTimeout(() => definirSucessoLink(false), 8000);
    } catch (erro) {
      console.error("Erro ao enviar e-mail:", erro);
      alert("Erro ao enviar e-mail de redefinicao.");
    } finally {
      definirEnviandoEmail(false);
    }
  };

  const lidarComDescartar = () => {
    // Reset Perfil
    definirNome(usuario?.nome || "");

    // Reset Operacional (Voltando para os defaults do sistema)
    definirCustoEnergia("R$ 0,95");
    definirHoraMaquina("R$ 5,00");
    definirHoraOperador("R$ 20,00");
    definirMargemLucro("150,00%");

    // Reset Aparencia (Usando os valores capturados no mount)
    themeContext.definir_modo_tema(inicialAparencia.modo);
    themeContext.definir_cor_primaria(inicialAparencia.cor);
    themeContext.definir_fonte(inicialAparencia.fonte);
  };

  const lidarComSalvar = async () => {
    definirSalvando(true);
    definirSucesso(false);
    try {
      await atualizarPerfil({ nome });

      // Atualiza o estado "Original" para as novas configuracoes salvas
      definirInicialAparencia({
        modo: themeContext.modo_tema,
        cor: themeContext.cor_primaria,
        fonte: themeContext.fonte
      });

      definirSucesso(true);
      definirToastVisivel(true);
      setTimeout(() => {
        definirSucesso(false);
        definirToastVisivel(false);
      }, 4000);
    } catch (erro) {
      console.error("Erro ao salvar:", erro);
      definirToastVisivel(true);
      setTimeout(() => definirToastVisivel(false), 4000);
    } finally {
      definirSalvando(false);
    }
  };

  usarDefinirCabecalho({
    titulo: "Configurações",
    subtitulo: temAlteracoes
      ? `Você possui ${totalAlteracoes} ${totalAlteracoes === 1 ? 'seção com alterações pendentes' : 'seções com alterações pendentes'}`
      : "Gestão operacional e proteção de dados (LGPD)",
    ocultarBusca: true,
    acao: {
      texto: salvando ? "Salvando..." : sucesso ? "Salvo!" : temAlteracoes ? `Salvar (${totalAlteracoes})` : "Salvar",
      icone: sucesso ? Check : salvando ? Loader2 : Save,
      aoClicar: lidarComSalvar,
      desabilitado: salvando || !temAlteracoes,
    },
    segundaAcao: temAlteracoes ? {
      texto: "Descartar",
      icone: X,
      aoClicar: lidarComDescartar,
      desabilitado: salvando
    } : undefined
  });

  return (
    <div className="flex-1 w-full overflow-y-auto p-4 md:p-6">
      <div className="mx-auto w-full max-w-6xl space-y-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardPerfil
            usuario={usuario}
            nome={nome}
            definirNome={definirNome}
            enviandoEmail={enviandoEmail}
            sucessoEmail={sucessoLink}
            lidarComTrocaSenha={lidarComTrocaSenha}
            pendente={perfilPendente}
          />
          <CardOperacional
            custoEnergia={custoEnergia}
            definirCustoEnergia={definirCustoEnergia}
            horaMaquina={horaMaquina}
            definirHoraMaquina={definirHoraMaquina}
            horaOperador={horaOperador}
            definirHoraOperador={definirHoraOperador}
            margemLucro={margemLucro}
            definirMargemLucro={definirMargemLucro}
            pendente={operacionalPendente}
          />
          <CardAparencia pendente={aparenciaPendente} />
          <CardMetricas />
        </div>
        <CardPrivacidade />

        <div className="pt-4 pb-8 border-t border-gray-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p></p>
          <p className="text-[10px] text-gray-400 dark:text-zinc-600 text-center md:text-right leading-relaxed">
            Plataforma em conformidade com a Lei Federal nº 13.709/2018 (LGPD).<br />
            Dados criptografados e processados sob rigorosos padrões de segurança.
          </p>
        </div>
      </div>

      {toastVisivel && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="rounded-xl border border-white/20 bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-white flex items-center gap-2 shadow-2xl">
            <Check size={16} />
            {sucesso ? "Configuracoes salvas com sucesso!" : "E-mail enviado com sucesso!"}
          </div>
        </div>
      )}
    </div>
  );
}
