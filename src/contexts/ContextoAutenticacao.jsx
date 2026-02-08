import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../servicos/firebase';

const ContextoAutenticacao = createContext();

export function usarAutenticacao() {
    return useContext(ContextoAutenticacao);
}

export function ProvedorAutenticacao({ children }) {
    const [usuarioAtual, definirUsuarioAtual] = useState(null);
    const [carregando, definirCarregando] = useState(true);

    useEffect(() => {
        const cancelarInscricao = onAuthStateChanged(auth, async (usuario) => {
            if (usuario) {
                // Atualiza token se necessário
                const token = await usuario.getIdToken();
                usuario.token = token;
            }
            definirUsuarioAtual(usuario);
            definirCarregando(false);
        });

        return cancelarInscricao;
    }, []);

    const entrar = (params = {}) => {
        const provedor = new GoogleAuthProvider();
        // Opcional: Forçar seleção de conta e permitir restrição de domínio
        provedor.setCustomParameters({
            prompt: 'select_account',
            ...params
        });
        return signInWithPopup(auth, provedor);
    };

    const sair = () => {
        return signOut(auth);
    };

    const valor = {
        usuarioAtual,
        entrar,
        sair
    };

    return (
        <ContextoAutenticacao.Provider value={valor}>
            {!carregando && children}
        </ContextoAutenticacao.Provider>
    );
}
