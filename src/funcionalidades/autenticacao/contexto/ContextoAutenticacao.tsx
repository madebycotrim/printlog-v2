
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
    browserLocalPersistence
} from 'firebase/auth';
import { autenticacao } from '@/compartilhado/infraestrutura/firebase';

interface Usuario {
    uid: string;
    email: string | null;
    nome: string | null;
    fotoUrl: string | null;
}

interface ContextoAutenticacaoProps {
    usuario: Usuario | null;
    carregando: boolean;
    login: (email: string, senha: string) => Promise<void>;
    cadastro: (email: string, senha: string, nome: string) => Promise<void>;
    sair: () => Promise<void>;
    recuperarSenha: (email: string) => Promise<void>;
    loginGoogle: () => Promise<void>;
}

const ContextoAutenticacao = createContext<ContextoAutenticacaoProps>({} as ContextoAutenticacaoProps);

export function usarAutenticacao() {
    return useContext(ContextoAutenticacao);
}

interface ProvedorAutenticacaoProps {
    children: ReactNode;
}

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
                definirUsuario({
                    uid: user.uid,
                    email: user.email,
                    nome: user.displayName,
                    fotoUrl: user.photoURL
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
            case 'auth/email-already-in-use':
                throw new Error('Este email já está em uso.');
            case 'auth/invalid-email':
                throw new Error('O email informado é inválido.');
            case 'auth/operation-not-allowed':
                throw new Error('Operação não permitida.');
            case 'auth/weak-password':
                throw new Error('A senha é muito fraca. Escolha uma senha mais forte.');
            case 'auth/user-disabled':
                throw new Error('Este usuário foi desativado.');
            case 'auth/user-not-found':
            case 'auth/invalid-credential':
                throw new Error('Email ou senha incorretos.');
            case 'auth/wrong-password':
                throw new Error('Senha incorreta.');
            default:
                throw new Error('Ocorreu um erro inesperado. Tente novamente mais tarde.');
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
            const credencial = await createUserWithEmailAndPassword(autenticacao, email, senha);
            await updateProfile(credencial.user, { displayName: nome });
            // Atualiza o estado local imediatamente para refletir o nome
            definirUsuario({
                uid: credencial.user.uid,
                email: credencial.user.email,
                nome: nome,
                fotoUrl: credencial.user.photoURL
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
    }

    const valor = {
        usuario,
        carregando,
        login,
        cadastro,
        sair,
        recuperarSenha,
        loginGoogle
    };

    return (
        <ContextoAutenticacao.Provider value={valor}>
            {!carregando && children}
        </ContextoAutenticacao.Provider>
    );
}
