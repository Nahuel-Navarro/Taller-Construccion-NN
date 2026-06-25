export default function CarritoItem({ item, onActualizarCantidad, onEliminar }) {
  const handleCambioCantidad = (nueva) => {
    if (nueva < 1) return;
    onActualizarCantidad(item.id, nueva);
  };

  return (
    <div className="carrito-item">
      <div className="carrito-item-info">
        <div className="carrito-item-nombre">{item.nombreProducto}</div>
        <div className="carrito-item-precio">
          ${Number(item.precioUnitario).toLocaleString('es-AR')} c/u
        </div>
      </div>
      <div className="carrito-item-cantidad">
        <button
          type="button"
          className="qty-btn"
          onClick={() => handleCambioCantidad(item.cantidad - 1)}
          disabled={item.cantidad <= 1}
        >−</button>
        <span className="qty-valor">{item.cantidad}</span>
        <button
          type="button"
          className="qty-btn"
          onClick={() => handleCambioCantidad(item.cantidad + 1)}
        >+</button>
      </div>
      <div className="carrito-item-subtotal">
        ${Number(item.subtotal).toLocaleString('es-AR')}
      </div>
      <button
        type="button"
        className="btn-eliminar"
        onClick={() => onEliminar(item.id)}
        aria-label="Eliminar"
      >
        ×
      </button>
    </div>
  );
}
