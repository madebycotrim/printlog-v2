import { Navigate } from "react-router-dom";
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contexto/ContextoAutenticacao";

interface RotaProtegidaProps {
  children: React.ReactNode;
}

export function RotaProtegida({ children }: RotaProtegidaProps) {
  const { usuario, carregando } = usarAutenticacao();

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0e0e11]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" state={{ from: window.location.pathname + window.location.search }} replace />;
  }

  return <>{children}</>;
}
