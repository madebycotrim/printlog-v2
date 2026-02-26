import { Navigate } from "react-router-dom";
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contexto/ContextoAutenticacao";
import { Carregamento } from "@/compartilhado/componentes_ui/Carregamento";

interface RotaProtegidaProps {
  children: React.ReactNode;
}

export function RotaProtegida({ children }: RotaProtegidaProps) {
  const { usuario, carregando } = usarAutenticacao();

  if (carregando) {
    return <Carregamento texto="Verificando Acesso..." />;
  }

  if (!usuario) {
    return <Navigate to="/login" state={{ from: window.location.pathname + window.location.search }} replace />;
  }

  return <>{children}</>;
}
