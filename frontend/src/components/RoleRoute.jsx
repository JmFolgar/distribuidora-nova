import SinPermisoPage from "../pages/SinPermisoPage";
import { useAuth } from "../auth/AuthContext";

export default function RoleRoute({ roles, children }) {
  const { usuario } = useAuth();
  const permitido = roles.includes(usuario?.rol);

  if (!permitido) {
    return <SinPermisoPage />;
  }

  return children;
}
