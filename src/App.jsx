import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { ProvedorAutenticacao } from './contexts/ContextoAutenticacao';
import LeitorPortaria from './paginas/LeitorPortaria';
import Painel from './paginas/Painel';
import Login from './paginas/Login';
import Alunos from './paginas/Alunos';
import Crachas from './paginas/Crachas';
import Relatorios from './paginas/Relatorios';
import { Home, Users, Printer, LogOut, QrCode, FileText } from 'lucide-react';

function Layout({ children }) {
  const location = useLocation();
  // Don't show nav on login or portaria (scanner mode)
  const hideNav = location.pathname === '/login' || location.pathname === '/portaria';

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNav && (
        <nav className="bg-gray-900 text-white p-4 flex justify-between items-center print:hidden">
          <div className="font-bold text-xl flex items-center gap-2">
            <QrCode className="text-blue-400" />
            <span>SCAE</span>
          </div>
          <div className="flex gap-6">
            <Link to="/painel" className={`flex items-center gap-1 hover:text-blue-300 ${location.pathname === '/painel' ? 'text-blue-400' : ''}`}>
              <Home size={18} /> Painel
            </Link>
            <Link to="/portaria" className={`flex items-center gap-1 hover:text-blue-300 ${location.pathname === '/portaria' ? 'text-blue-400' : ''}`}>
              <QrCode size={18} /> Portaria
            </Link>
            <Link to="/alunos" className={`flex items-center gap-1 hover:text-blue-300 ${location.pathname === '/alunos' ? 'text-blue-400' : ''}`}>
              <Users size={18} /> Alunos
            </Link>
            <Link to="/crachas" className={`flex items-center gap-1 hover:text-blue-300 ${location.pathname === '/crachas' ? 'text-blue-400' : ''}`}>
              <Printer size={18} /> Crachás
            </Link>
            <Link to="/relatorios" className={`flex items-center gap-1 hover:text-blue-300 ${location.pathname === '/relatorios' ? 'text-blue-400' : ''}`}>
              <FileText size={18} /> Relatórios
            </Link>
          </div>
          <Link to="/login" className="text-sm text-red-300 hover:text-red-200 flex items-center gap-1">
            <LogOut size={16} /> Sair
          </Link>
        </nav>
      )}
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
            <Route path="/alunos" element={<Alunos />} />
            <Route path="/crachas" element={<Crachas />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/" element={<Navigate to="/portaria" />} />
          </Routes>
        </Layout>
      </ProvedorAutenticacao>
    </Router>
  );
}

export default App;
