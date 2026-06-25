import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productosApi } from '../api/ecomarket';
import { useToast } from '../components/Toast';
import ProductoForm from '../components/ProductoForm';

export default function ProductoFormPage() {
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [productoInicial, setProductoInicial] = useState(null);
  const [cargando, setCargando] = useState(esEdicion);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!esEdicion) return;
    productosApi.obtener(id)
      .then(setProductoInicial)
      .catch((err) => {
        toast.show(err.message, 'error');
        navigate('/admin/productos');
      })
      .finally(() => setCargando(false));
  }, [id, esEdicion, navigate, toast]);

  const handleSubmit = async (datos) => {
    setEnviando(true);
    try {
      if (esEdicion) {
        await productosApi.actualizar(id, datos);
        toast.show('Producto actualizado correctamente', 'exito');
      } else {
        await productosApi.crear(datos);
        toast.show('Producto creado correctamente', 'exito');
      }
      navigate('/admin/productos');
    } catch (err) {
      toast.show(err.message, 'error');
      if (err.detalles) {
        err.detalles.forEach((d) => toast.show(d, 'error'));
      }
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <div className="container"><div className="estado-vacio">Cargando...</div></div>;

  return (
    <div className="container container-narrow">
      <h1 className="page-titulo">
        {esEdicion ? 'Editar producto' : 'Nuevo producto'}
      </h1>
      <ProductoForm
        productoInicial={productoInicial}
        onSubmit={handleSubmit}
        onCancelar={() => navigate('/admin/productos')}
        enviando={enviando}
      />
    </div>
  );
}
