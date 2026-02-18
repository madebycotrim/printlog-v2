import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type PropriedadesLayout = {
    children: ReactNode;
};

export function Layout({ children }: PropriedadesLayout) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link to="/" className="text-xl font-bold text-gray-900">
                            PrintLog V2
                        </Link>
                    </div>
                    <nav className="flex space-x-4">
                        <Link to="/filamentos" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Filamentos</Link>
                        <Link to="/impressoras" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Impressoras</Link>
                        <Link to="/projetos" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Projetos</Link>
                        <Link to="/clientes" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Clientes</Link>
                        <Link to="/financeiro" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Financeiro</Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <p className="text-center text-sm text-gray-500">© 2026 PrintLog. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    );
}
