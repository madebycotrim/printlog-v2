import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  AuthError,
  setPersistence,
  browserLocalPersistence,
  deleteUser,
  signInAnonymously,
} from "firebase/auth";
import { autenticacao } from "@/compartilhado/infraestrutura/firebase";

interface Usuario {
  uid: string;
  email: string | null;
  nome: string | null;
  fotoUrl: string | null;
  provedorGoogle: boolean;
  ehAnonimo: boolean;
}

interface ContextoAutenticacaoProps {
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  cadastro: (email: string, senha: string, nome: string) => Promise<void>;
  sair: () => Promise<void>;
  recuperarSenha: (email: string) => Promise<void>;
  loginGoogle: () => Promise<void>;
  atualizarPerfil: (dados: { nome?: string; fotoUrl?: string }) => Promise<void>;
  excluirConta: () => Promise<void>;
  exportarDadosPessoais: () => Promise<void>;
  loginAnonimo: () => Promise<void>;
}

const ContextoAutenticacao = createContext<ContextoAutenticacaoProps>(
  {} as ContextoAutenticacaoProps,
);

export function usarAutenticacao() {
  return useContext(ContextoAutenticacao);
}

interface ProvedorAutenticacaoProps {
  children: ReactNode;
}

const obterIpUsuario = async (): Promise<string> => {
  try {
    const resposta = await fetch("https://api.ipify.org?format=json");
    const dados = await resposta.json();
    return dados.ip;
  } catch (erro) {
    console.error("Erro ao obter IP:", erro);
    return "0.0.0.0";
  }
};

const registrarAceiteTermos = async (uid: string) => {
  try {
    const ip = await obterIpUsuario();
    const payload = {
      user_id: uid,
      data_aceite: new Date().toISOString(),
      versao_termos: "2026-02-24",
      versao_politica: "2026-02-24",
      ip: ip,
    };

    // Simulação - Integrar com Cloudflare D1 em breve
    console.log("Registrando aceite no banco de dados (Cloudflare D1):", payload);

    // Exemplo de como será a requisição real
    // await fetch("YOUR_CLOUDFLARE_WORKER_URL/aceites", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(payload),
    // });

  } catch (erro) {
    console.error("Falha ao registrar aceite:", erro);
  }
};

export function ProvedorAutenticacao({ children }: ProvedorAutenticacaoProps) {
  const [usuario, definirUsuario] = useState<Usuario | null>(null);
  const [carregando, definirCarregando] = useState(true);

  useEffect(() => {
    // Configura persistência local (mantém logado mesmo fechando o navegador)
    const configurarPersistencia = async () => {
      try {
        await setPersistence(autenticacao, browserLocalPersistence);
      } catch (erro) {
        console.error("Erro ao configurar persistência:", erro);
      }
    };
    configurarPersistencia();

    const cancelarInscricao = onAuthStateChanged(autenticacao, (user) => {
      if (user) {
        const ehGoogle = user.providerData.some(
          (provedor) => provedor.providerId === "google.com"
        );
        definirUsuario({
          uid: user.uid,
          email: user.email,
          nome: user.displayName,
          fotoUrl: user.photoURL,
          provedorGoogle: ehGoogle,
          ehAnonimo: user.isAnonymous,
        });
      } else {
        definirUsuario(null);
      }
      definirCarregando(false);
    });

    return () => cancelarInscricao();
  }, []);

  const traduzirErroFirebase = (erro: AuthError) => {
    console.error("Erro Firebase:", erro.code, erro.message);
    switch (erro.code) {
      case "auth/email-already-in-use":
        throw new Error("Este email já está em uso.");
      case "auth/invalid-email":
        throw new Error("O email informado é inválido.");
      case "auth/operation-not-allowed":
        throw new Error("Operação não permitida.");
      case "auth/weak-password":
        throw new Error("A senha é muito fraca. Escolha uma senha mais forte.");
      case "auth/user-disabled":
        throw new Error("Este usuário foi desativado.");
      case "auth/user-not-found":
      case "auth/invalid-credential":
        throw new Error("Email ou senha incorretos.");
      case "auth/wrong-password":
        throw new Error("Senha incorreta.");
      default:
        throw new Error(
          "Ocorreu um erro inesperado. Tente novamente mais tarde.",
        );
    }
  };

  const login = async (email: string, senha: string) => {
    try {
      await signInWithEmailAndPassword(autenticacao, email, senha);
    } catch (erro: any) {
      traduzirErroFirebase(erro);
    }
  };

  const cadastro = async (email: string, senha: string, nome: string) => {
    try {
      const credencial = await createUserWithEmailAndPassword(
        autenticacao,
        email,
        senha,
      );
      await updateProfile(credencial.user, { displayName: nome });

      await registrarAceiteTermos(credencial.user.uid);

      // Atualiza o estado local imediatamente para refletir o nome
      definirUsuario({
        uid: credencial.user.uid,
        email: credencial.user.email,
        nome: nome,
        fotoUrl: credencial.user.photoURL,
        provedorGoogle: false,
        ehAnonimo: false,
      });
    } catch (erro: any) {
      traduzirErroFirebase(erro);
    }
  };

  const sair = async () => {
    try {
      await signOut(autenticacao);
    } catch (erro: any) {
      console.error("Erro ao sair:", erro);
    }
  };

  const recuperarSenha = async (email: string) => {
    try {
      await sendPasswordResetEmail(autenticacao, email);
    } catch (erro: any) {
      traduzirErroFirebase(erro);
    }
  };

  const loginGoogle = async () => {
    try {
      const provedor = new GoogleAuthProvider();
      await signInWithPopup(autenticacao, provedor);
    } catch (erro: any) {
      traduzirErroFirebase(erro);
    }
  };

  const loginAnonimo = async () => {
    try {
      await signInAnonymously(autenticacao);
    } catch (erro: any) {
      traduzirErroFirebase(erro);
    }
  };

  const atualizarPerfil = async (dados: {
    nome?: string;
    fotoUrl?: string;
  }) => {
    try {
      if (!autenticacao.currentUser) throw new Error("Usuário não autenticado.");

      await updateProfile(autenticacao.currentUser, {
        displayName: dados.nome || autenticacao.currentUser.displayName,
        photoURL: dados.fotoUrl || autenticacao.currentUser.photoURL,
      });

      // Atualiza estado local
      definirUsuario((prev) =>
        prev
          ? {
            ...prev,
            nome: dados.nome || prev.nome,
            fotoUrl: dados.fotoUrl || prev.fotoUrl,
          }
          : null,
      );
    } catch (erro: any) {
      traduzirErroFirebase(erro);
    }
  };

  const excluirConta = async () => {
    try {
      if (!autenticacao.currentUser) throw new Error("Usuário não autenticado.");
      await deleteUser(autenticacao.currentUser);
    } catch (erro: any) {
      traduzirErroFirebase(erro);
    }
  };

  const exportarDadosPessoais = async () => {
    try {
      if (!usuario) throw new Error("Usuário não autenticado.");

      const dadosExportacao = {
        perfil: usuario,
        dataExportacao: new Date().toISOString(),
        metadados: {
          versaoTermosAceitos: "2026-02-24",
          statusConsentimento: "ATIVO"
        }
      };

      const blob = new Blob([JSON.stringify(dadosExportacao, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dados-pessoais-printlog-${usuario.uid}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (erro: any) {
      traduzirErroFirebase(erro);
    }
  };

  const valor = {
    usuario,
    carregando,
    login,
    cadastro,
    sair,
    recuperarSenha,
    loginGoogle,
    atualizarPerfil,
    excluirConta,
    exportarDadosPessoais,
    loginAnonimo,
  };

  return (
    <ContextoAutenticacao.Provider value={valor}>
      {!carregando && children}
    </ContextoAutenticacao.Provider>
  );
}
