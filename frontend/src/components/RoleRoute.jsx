import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function RoleRoute({ roles, children }) {
  const { usuario } = useAuth();
  const permitido = roles.includes(usuario?.rol);

  if (!permitido) {
    return <Navigate to="/menu" replace />;
  }

  return children;
}
