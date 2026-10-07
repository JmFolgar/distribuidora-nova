import { useEffect, useState } from "react";
import { getHealth } from "./api/client";
import "./App.css";

function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHealth()
      .then((data) => {
        setHealth(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setHealth(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="brand-mark">DN</span>
          <div>
            <h1>Distribuidora Nova</h1>
            <p className="tagline">Sistema de gestión — Ferretería</p>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="panel">
          <h2>Estado del sistema</h2>
          <p className="muted">
            Verificación de conexión entre frontend, API y base de datos.
          </p>

          {loading && <p className="status pending">Comprobando API…</p>}

          {!loading && error && (
            <div className="status error">
              <strong>API no disponible</strong>
              <p>{error}</p>
              <p className="hint">
                Asegúrate de tener el backend corriendo (`npm run dev:backend`)
                y PostgreSQL con Docker (`npm run db:up`).
              </p>
            </div>
          )}

          {!loading && health && (
            <div className="status ok">
              <strong>{health.service}</strong>
              <ul>
                <li>
                  Estado: <code>{health.status}</code>
                </li>
                <li>
                  Base de datos: <code>{health.database}</code>
                </li>
                <li>
                  Timestamp: <code>{health.timestamp}</code>
                </li>
              </ul>
            </div>
          )}
        </section>

        <section className="panel">
          <h2>Próximos módulos</h2>
          <ul className="modules">
            <li>Inventario / Productos</li>
            <li>Clientes</li>
            <li>Ventas</li>
            <li>Reportes</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
