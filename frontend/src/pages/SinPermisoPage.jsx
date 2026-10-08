import { Link } from "react-router-dom";
import { ShieldOff } from "lucide-react";
import AppShell from "../layout/AppShell";

export default function SinPermisoPage() {
  return (
    <AppShell>
      <div className="permission-page">
        <h1 className="page-title permission-page__title">Acceso restringido</h1>
        <section className="card permission-card">
          <div className="permission-card__icon" aria-hidden>
            <ShieldOff size={28} strokeWidth={1.75} />
          </div>
          <h2 className="permission-card__title">
            No tienes permiso para esta pantalla
          </h2>
          <Link to="/menu" className="btn btn-primary btn-inline">
            Volver al dashboard
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
