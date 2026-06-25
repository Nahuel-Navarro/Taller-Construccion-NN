import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productosApi } from '../api/ecomarket';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';

export default function AdminProductosPage() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [productoEliminar, setProductoEliminar] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  const cargar = () => {
    setCargando(true);
    productosApi.listar()
      .then(setProductos)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  };

  useEffect(cargar, []);

  const handleEliminar = async () => {
    try {
      await productosApi.eliminar(productoEliminar.id);
      toast.show(`Producto "${productoEliminar.nombre}" eliminado`, 'exito');
      setProductoEliminar(null);
      cargar();
    } catch (err) {
      toast.show(err.message, 'error');
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-titulo">Gestión de productos</h1>
          <p className="page-subtitulo">Administrar el catálogo</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/productos/nuevo')}>
          + Nuevo producto
        </button>
      </div>

      {cargando && <div className="estado-vacio">Cargando...</div>}
      {error && <div className="estado-error">Error: {error}</div>}

      {!cargando && !error && (
        <div className="tabla-wrapper">
          <table className="tabla-admin">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td className="td-nombre">{p.nombre}</td>
                  <td>{p.categoria || '—'}</td>
                  <td>${Number(p.precio).toLocaleString('es-AR')}</td>
                  <td>
                    <span className={p.stock === 0 ? 'stock-cero' : ''}>{p.stock}</span>
                  </td>
                  <td>
                    <div className="tabla-acciones">
                      <Link to={`/productos/${p.id}/editar`} className="btn btn-sm btn-ghost">
                        Editar
                      </Link>
                      <button
                        type="button"
                        className="btn btn-sm btn-peligro-outline"
                        onClick={() => setProductoEliminar(p)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {productos.length === 0 && (
                <tr>
                  <td colSpan={6} className="td-vacio">No hay productos cargados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {productoEliminar && (
        <Modal
          titulo="Eliminar producto"
          mensaje={`¿Confirmás que querés eliminar "${productoEliminar.nombre}" del catálogo? Esta acción lo marcará como inactivo.`}
          textoConfirmar="Eliminar"
          tipo="peligro"
          onConfirmar={handleEliminar}
          onCancelar={() => setProductoEliminar(null)}
        />
      )}
    </div>
  );
}
