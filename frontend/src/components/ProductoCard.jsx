import { Link } from 'react-router-dom';

export default function ProductoCard({ producto, onAgregarCarrito }) {
  const sinStock = producto.stock === 0;

  return (
    <article className="producto-card">
      <div className="producto-card-imagen">
        <span className="producto-card-emoji">🌱</span>
        {producto.categoria && (
          <span className="producto-card-categoria">{producto.categoria}</span>
        )}
      </div>
      <div className="producto-card-body">
        <h3 className="producto-card-nombre">{producto.nombre}</h3>
        <p className="producto-card-desc">{producto.descripcion}</p>
        <div className="producto-card-footer">
          <div>
            <div className="producto-card-precio">${Number(producto.precio).toLocaleString('es-AR')}</div>
            <div className={`producto-card-stock ${sinStock ? 'sin-stock' : ''}`}>
              {sinStock ? 'Sin stock' : `${producto.stock} en stock`}
            </div>
          </div>
          <div className="producto-card-acciones">
            <Link to={`/productos/${producto.id}`} className="btn btn-ghost">Ver</Link>
            <button
              type="button"
              className="btn btn-primary"
              disabled={sinStock}
              onClick={() => onAgregarCarrito(producto)}
            >
              Agregar
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
