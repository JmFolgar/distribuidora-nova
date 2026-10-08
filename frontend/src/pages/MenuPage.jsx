import { Package, ShoppingCart, Users } from "lucide-react";
import AppShell from "../layout/AppShell";
import { useAuth } from "../auth/AuthContext";
import { ETIQUETA_ROL } from "../config/navigation";

export default function MenuPage() {
  const { usuario } = useAuth();

  return (
    <AppShell
      title="Dashboard"
      subtitle={`Bienvenido, ${usuario?.nombreCompleto?.split(" ")[0] || "usuario"}. Sesión como ${ETIQUETA_ROL[usuario?.rol] || usuario?.rol}.`}
    >
      <div className="card-grid">
        <section className="card">
          <h2 className="card-title">Sesión activa</h2>
          <p className="card-text">
            Tus acciones quedarán registradas a nombre de{" "}
            <strong className="mono">{usuario?.nombreUsuario}</strong> (
            {usuario?.correo}).
          </p>
          <div className="badge badge--info">
            {ETIQUETA_ROL[usuario?.rol] || usuario?.rol}
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">Próximos módulos</h2>
          <p className="card-text">
            El menú lateral ya muestra solo lo permitido para tu rol. Las
            pantallas se irán habilitando en los siguientes sprints.
          </p>
          <ul className="hint-list">
            <li>
              <Users size={16} strokeWidth={1.75} /> Clientes y catálogo
            </li>
            <li>
              <Package size={16} strokeWidth={1.75} /> Productos e inventario
            </li>
            <li>
              <ShoppingCart size={16} strokeWidth={1.75} /> Pedidos y ventas
            </li>
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
