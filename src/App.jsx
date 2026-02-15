import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { autenticacao } from './servicos/firebase';
import { ProvedorAutenticacao } from './contexts/ContextoAutenticacao';
import { ProvedorPermissoes } from './contexts/ContextoPermissoes';
import RotaPrivada from './componentes/RotaPrivada';
import LeitorPortaria from './paginas/LeitorPortaria';
import Painel from './paginas/Painel';
import Turmas from './paginas/Turmas';
import Login from './paginas/Login';
import Alunos from './paginas/Alunos';
import Crachas from './paginas/Crachas';
import Logs from './paginas/Logs';
import Chaves from './paginas/Chaves';
import Usuarios from './paginas/Usuarios';
import Relatorios from './paginas/Relatorios';
import Justificativas from './paginas/Justificativas';
import GeradorCrachas from './paginas/GeradorCrachas';
import LGPD from './paginas/LGPD';
import PainelExecutivo from './paginas/PainelExecutivo';
import { Toaster } from 'react-hot-toast';
import { Home, Users, Printer, LogOut, QrCode, FileText } from 'lucide-react';

function Layout({ children }) {
  // Don't show nav on login or portaria (scanner mode)
  // const ocultarNavegacao = localizacao.pathname === '/login' || localizacao.pathname === '/portaria';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Global Nav Removed */}
      <main className="flex-grow bg-gray-100">
        {children}
      </main>
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  // This useEffect block seems to belong to an authentication provider or a component managing user state.
  // For the purpose of fulfilling the request, it's placed here, assuming 'auth', 'setUsuario', 'setCarregando'
  // and 'servicoSincronizacao' would be properly defined or imported in a real application context.
  // In a typical React app, this logic would likely reside within 'ProvedorAutenticacao'.
  const [, definirUsuario] = useState(null);
  const [, definirCarregando] = useState(true);

  useEffect(() => {
    // v2.0 - Auth State
    const cancelarInscricao = onAuthStateChanged(autenticacao, (usuarioFirebase) => {
      definirUsuario(usuarioFirebase);
      definirCarregando(false);
      // Sync service removed - handled by individual components
    });

    return () => cancelarInscricao();
  }, []);

  return (
    <Router>
      <ProvedorAutenticacao>
        <ProvedorPermissoes>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/portaria" element={<LeitorPortaria />} />
              <Route path="/painel" element={<Painel />} />
              <Route path="/alunos" element={<Alunos />} />
              <Route path="/turmas" element={<Turmas />} />
              <Route path="/crachas" element={<Crachas />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/chaves" element={<Chaves />} />
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/justificativas" element={<Justificativas />} />
              <Route path="/lgpd" element={<LGPD />} />
              <Route path="/painel-executivo" element={<PainelExecutivo />} />
              <Route path="*" element={<Navigate to="/painel" replace />} />
            </Routes>
          </Layout>
        </ProvedorPermissoes>
      </ProvedorAutenticacao>
    </Router>
  );
}

export default App;
