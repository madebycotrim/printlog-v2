import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { ProvedorAutenticacao } from './contexts/ContextoAutenticacao';
import LeitorPortaria from './paginas/LeitorPortaria';
import Painel from './paginas/Painel';
import Turmas from './paginas/Turmas';
import Login from './paginas/Login';
import Alunos from './paginas/Alunos';
import Relatorios from './paginas/Relatorios';
import { Home, Users, Printer, LogOut, QrCode, FileText } from 'lucide-react';

function Layout({ children }) {
  const location = useLocation();
  // Don't show nav on login or portaria (scanner mode)
  const hideNav = location.pathname === '/login' || location.pathname === '/portaria';

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
            <Route path="/" element={<Navigate to="/portaria" />} />
          </Routes>
        </Layout>
      </ProvedorAutenticacao>
    </Router>
  );
}

export default App;
