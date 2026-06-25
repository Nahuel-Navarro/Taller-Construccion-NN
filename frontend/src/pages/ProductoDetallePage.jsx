import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productosApi } from '../api/ecomarket';
import { useCarrito } from '../context/CarritoContext';
import { useToast } from '../components/Toast';

export default function ProductoDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarProducto } = useCarrito();
  const toast = useToast();

  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    productosApi.obtener(id)
      .then((data) => { if (!cancelado) setProducto(data); })
      .catch((err) => { if (!cancelado) setError(err.message); })
      .finally(() => { if (!cancelado) setCargando(false); });
    return () => { cancelado = true; };
  }, [id]);

  const handleAgregar = async () => {
    try {
      await agregarProducto(producto.id, cantidad);
      toast.show(`${cantidad} × "${producto.nombre}" agregado al carrito`, 'exito');
      navigate('/carrito');
    } catch (err) {
      toast.show(err.message, 'error');
    }
  };

  if (cargando) return <div className="container"><div className="estado-vacio">Cargando...</div></div>;
  if (error) return <div className="container"><div className="estado-error">{error}</div></div>;
  if (!producto) return null;

  const sinStock = producto.stock === 0;

  return (
    <div className="container">
      <Link to="/" className="link-volver">← Volver al catálogo</Link>

      <div className="producto-detalle">
        <div className="producto-detalle-imagen">
          <span className="emoji-grande">🌱</span>
        </div>
        <div className="producto-detalle-info">
          {producto.categoria && (
            <div className="producto-detalle-categoria">{producto.categoria}</div>
          )}
          <h1 className="producto-detalle-nombre">{producto.nombre}</h1>
          <p className="producto-detalle-desc">{producto.descripcion || 'Sin descripción.'}</p>

          <div className="producto-detalle-precio">
            ${Number(producto.precio).toLocaleString('es-AR')}
          </div>
          <div className={`producto-detalle-stock ${sinStock ? 'sin-stock' : ''}`}>
            {sinStock ? 'Sin stock disponible' : `${producto.stock} unidades disponibles`}
          </div>

          {!sinStock && (
            <div className="producto-detalle-acciones">
              <div className="cantidad-selector">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                >−</button>
                <span className="qty-valor">{cantidad}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                >+</button>
              </div>
              <button type="button" className="btn btn-primary btn-lg" onClick={handleAgregar}>
                Agregar al carrito
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
