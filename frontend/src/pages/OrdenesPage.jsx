import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordenesApi } from '../api/ecomarket';

function formatearFecha(iso) {
  if (!iso) return '';
  const fecha = new Date(iso);
  return fecha.toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function OrdenesPage() {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;
    ordenesApi.listar()
      .then((data) => { if (!cancelado) setOrdenes(data); })
      .catch((err) => { if (!cancelado) setError(err.message); })
      .finally(() => { if (!cancelado) setCargando(false); });
    return () => { cancelado = true; };
  }, []);

  return (
    <div className="container">
      <h1 className="page-titulo">Historial de órdenes</h1>

      {cargando && <div className="estado-vacio">Cargando...</div>}
      {error && <div className="estado-error">{error}</div>}

      {!cargando && !error && ordenes.length === 0 && (
        <div className="estado-vacio-grande">
          <div className="estado-vacio-emoji">📦</div>
          <p>Todavía no realizaste ninguna compra.</p>
          <Link to="/" className="btn btn-primary">Ir al catálogo</Link>
        </div>
      )}

      <div className="ordenes-lista">
        {ordenes.map((o) => (
          <Link key={o.id} to={`/ordenes/${o.id}`} className="orden-card">
            <div className="orden-card-header">
              <span className="orden-id">Orden #{o.id}</span>
              <span className="orden-fecha">{formatearFecha(o.fechaConfirmacion)}</span>
            </div>
            <div className="orden-card-body">
              <div className="orden-items-resumen">
                {o.items.length} producto{o.items.length !== 1 ? 's' : ''}: {o.items.map(i => i.nombreProducto).join(', ')}
              </div>
              <div className="orden-total">
                ${Number(o.total).toLocaleString('es-AR')}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
