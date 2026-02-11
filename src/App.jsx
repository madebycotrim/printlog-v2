import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { autenticacao } from './servicos/firebase';
import { servicoSincronizacao } from './servicos/sincronizacao';
import { ProvedorAutenticacao } from './contexts/ContextoAutenticacao';
import LeitorPortaria from './paginas/LeitorPortaria';
import Painel from './paginas/Painel';
import Turmas from './paginas/Turmas';
import Login from './paginas/Login';
import Alunos from './paginas/Alunos';
import Relatorios from './paginas/Relatorios';
import GeradorCrachas from './paginas/GeradorCrachas';
import { Home, Users, Printer, LogOut, QrCode, FileText } from 'lucide-react';

function Layout({ children }) {
  const localizacao = useLocation();
  // Don't show nav on login or portaria (scanner mode)
  const ocultarNavegacao = localizacao.pathname === '/login' || localizacao.pathname === '/portaria';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Global Nav Removed */}
      <main className="flex-grow bg-gray-100">
        {children}
      </main>
    </div>
  );
}

function App() {
  // This useEffect block seems to belong to an authentication provider or a component managing user state.
  // For the purpose of fulfilling the request, it's placed here, assuming 'auth', 'setUsuario', 'setCarregando'
  // and 'servicoSincronizacao' would be properly defined or imported in a real application context.
  // In a typical React app, this logic would likely reside within 'ProvedorAutenticacao'.
  const [usuario, definirUsuario] = useState(null);
  const [carregando, definirCarregando] = useState(true);

  useEffect(() => {
    // v2.0 - Auth State
    const cancelarInscricao = onAuthStateChanged(autenticacao, (usuarioFirebase) => {
      definirUsuario(usuarioFirebase);
      definirCarregando(false);
      if (usuarioFirebase) {
        // v3.0 - Hybrid Sync
        servicoSincronizacao.iniciarOuvintes();
      }
    });

    return () => cancelarInscricao();
  }, []);

  return (
    <Router>
      <ProvedorAutenticacao>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/portaria" element={<LeitorPortaria />} />
            <Route path="/painel" element={<Painel />} />
            <Route path="/turmas" element={<Turmas />} />
            <Route path="/alunos" element={<Alunos />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/gerador" element={<GeradorCrachas />} />
            <Route path="/" element={<Navigate to="/portaria" />} />
          </Routes>
        </Layout>
      </ProvedorAutenticacao>
    </Router>
  );
}

export default App;
