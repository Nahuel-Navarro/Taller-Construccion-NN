import { useState, useEffect } from 'react';
import { productosApi } from '../api/ecomarket';
import { useCarrito } from '../context/CarritoContext';
import { useToast } from '../components/Toast';
import ProductoCard from '../components/ProductoCard';

export default function CatalogoPage() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [categoriaSel, setCategoriaSel] = useState('todas');

  const { agregarProducto } = useCarrito();
  const toast = useToast();

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    productosApi.listar()
      .then((data) => { if (!cancelado) setProductos(data); })
      .catch((err) => { if (!cancelado) setError(err.message); })
      .finally(() => { if (!cancelado) setCargando(false); });
    return () => { cancelado = true; };
  }, []);

  const categorias = ['todas', ...new Set(productos.map((p) => p.categoria).filter(Boolean))];

  const productosFiltrados = productos.filter((p) => {
    const matchTexto = p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
                       (p.descripcion ?? '').toLowerCase().includes(filtro.toLowerCase());
    const matchCategoria = categoriaSel === 'todas' || p.categoria === categoriaSel;
    return matchTexto && matchCategoria;
  });

  const handleAgregarCarrito = async (producto) => {
    try {
      await agregarProducto(producto.id, 1);
      toast.show(`"${producto.nombre}" agregado al carrito`, 'exito');
    } catch (err) {
      toast.show(err.message, 'error');
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-titulo">Catálogo</h1>
          <p className="page-subtitulo">Productos sostenibles para una vida más consciente</p>
        </div>
      </div>

      <div className="filtros">
        <input
          type="search"
          placeholder="Buscar productos..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="input-busqueda"
        />
        <select value={categoriaSel} onChange={(e) => setCategoriaSel(e.target.value)} className="select-cat">
          {categorias.map((c) => (
            <option key={c} value={c}>{c === 'todas' ? 'Todas las categorías' : c}</option>
          ))}
        </select>
      </div>

      {cargando && <div className="estado-vacio">Cargando productos...</div>}
      {error && <div className="estado-error">Error: {error}</div>}

      {!cargando && !error && productosFiltrados.length === 0 && (
        <div className="estado-vacio">No se encontraron productos con esos criterios.</div>
      )}

      <div className="grid-productos">
        {productosFiltrados.map((p) => (
          <ProductoCard
            key={p.id}
            producto={p}
            onAgregarCarrito={handleAgregarCarrito}
          />
        ))}
      </div>
    </div>
  );
}
