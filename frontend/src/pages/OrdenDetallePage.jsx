import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordenesApi } from '../api/ecomarket';

function formatearFecha(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function OrdenDetallePage() {
  const { id } = useParams();
  const [orden, setOrden] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;
    ordenesApi.obtener(id)
      .then((data) => { if (!cancelado) setOrden(data); })
      .catch((err) => { if (!cancelado) setError(err.message); })
      .finally(() => { if (!cancelado) setCargando(false); });
    return () => { cancelado = true; };
  }, [id]);

  if (cargando) return <div className="container"><div className="estado-vacio">Cargando...</div></div>;
  if (error) return <div className="container"><div className="estado-error">{error}</div></div>;
  if (!orden) return null;

  return (
    <div className="container">
      <Link to="/ordenes" className="link-volver">← Volver al historial</Link>

      <div className="orden-detalle">
        <div className="orden-detalle-header">
          <div>
            <h1 className="page-titulo">Orden #{orden.id}</h1>
            <p className="orden-detalle-fecha">Confirmada el {formatearFecha(orden.fechaConfirmacion)}</p>
          </div>
          <div className="orden-detalle-total">
            <span className="label">Total</span>
            <span className="valor">${Number(orden.total).toLocaleString('es-AR')}</span>
          </div>
        </div>

        {orden.mensaje && (
          <div className="orden-mensaje-box">
            <strong>Mensaje:</strong> {orden.mensaje}
          </div>
        )}

        <h3 className="seccion-titulo">Productos</h3>
        <div className="orden-items-detalle">
          {orden.items.map((it) => (
            <div key={it.id} className="orden-item-row">
              <div className="orden-item-nombre">{it.nombreProducto}</div>
              <div className="orden-item-cantidad">{it.cantidad} × ${Number(it.precioUnitario).toLocaleString('es-AR')}</div>
              <div className="orden-item-subtotal">${Number(it.subtotal).toLocaleString('es-AR')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
