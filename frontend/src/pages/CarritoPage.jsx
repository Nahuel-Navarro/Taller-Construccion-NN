import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ordenesApi } from '../api/ecomarket';
import { useCarrito } from '../context/CarritoContext';
import { useToast } from '../components/Toast';
import CarritoItem from '../components/CarritoItem';

export default function CarritoPage() {
  const { carrito, carritoId, actualizarCantidad, eliminarItem, limpiarCarrito } = useCarrito();
  const navigate = useNavigate();
  const toast = useToast();

  const [mensaje, setMensaje] = useState('');
  const [confirmando, setConfirmando] = useState(false);

  const handleActualizar = async (itemId, cantidad) => {
    try {
      await actualizarCantidad(itemId, cantidad);
    } catch (err) {
      toast.show(err.message, 'error');
    }
  };

  const handleEliminar = async (itemId) => {
    try {
      await eliminarItem(itemId);
      toast.show('Producto eliminado del carrito', 'info');
    } catch (err) {
      toast.show(err.message, 'error');
    }
  };

  const handleConfirmar = async () => {
    if (!carritoId) return;
    setConfirmando(true);
    try {
      const orden = await ordenesApi.confirmar(carritoId, mensaje.trim() || null);
      limpiarCarrito();
      toast.show(`Orden #${orden.id} confirmada`, 'exito');
      navigate(`/ordenes/${orden.id}`);
    } catch (err) {
      toast.show(err.message, 'error');
    } finally {
      setConfirmando(false);
    }
  };

  const items = carrito?.items ?? [];
  const total = carrito?.total ?? 0;

  if (items.length === 0) {
    return (
      <div className="container">
        <h1 className="page-titulo">Tu carrito</h1>
        <div className="estado-vacio-grande">
          <div className="estado-vacio-emoji">🛒</div>
          <p>Tu carrito está vacío.</p>
          <Link to="/" className="btn btn-primary">Ir al catálogo</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-titulo">Tu carrito</h1>

      <div className="carrito-layout">
        <div className="carrito-items">
          <div className="carrito-header">
            <div>Producto</div>
            <div>Cantidad</div>
            <div>Subtotal</div>
            <div></div>
          </div>
          {items.map((item) => (
            <CarritoItem
              key={item.id}
              item={item}
              onActualizarCantidad={handleActualizar}
              onEliminar={handleEliminar}
            />
          ))}
        </div>

        <aside className="carrito-resumen">
          <h3>Resumen del pedido</h3>
          <div className="resumen-fila">
            <span>Productos ({carrito.cantidadItems})</span>
            <span>${Number(total).toLocaleString('es-AR')}</span>
          </div>
          <div className="resumen-total">
            <span>Total</span>
            <span>${Number(total).toLocaleString('es-AR')}</span>
          </div>

          <label className="resumen-mensaje">
            Mensaje para el pedido (opcional)
            <textarea
              rows={3}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              maxLength={500}
              placeholder="Ej: entregar después de las 18hs"
              disabled={confirmando}
            />
            <small>{mensaje.length}/500</small>
          </label>

          <button
            type="button"
            className="btn btn-primary btn-lg btn-bloque"
            onClick={handleConfirmar}
            disabled={confirmando}
          >
            {confirmando ? 'Confirmando...' : 'Confirmar pedido'}
          </button>
          <Link to="/" className="link-volver">Seguir comprando</Link>
        </aside>
      </div>
    </div>
  );
}
