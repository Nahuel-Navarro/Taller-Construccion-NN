import { useState, useEffect } from 'react';

const VALOR_INICIAL = {
  nombre: '',
  descripcion: '',
  precio: '',
  stock: '',
  categoria: '',
  activo: true,
};

export default function ProductoForm({ productoInicial, onSubmit, onCancelar, enviando }) {
  const [datos, setDatos] = useState(VALOR_INICIAL);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (productoInicial) {
      setDatos({
        nombre: productoInicial.nombre ?? '',
        descripcion: productoInicial.descripcion ?? '',
        precio: productoInicial.precio ?? '',
        stock: productoInicial.stock ?? '',
        categoria: productoInicial.categoria ?? '',
        activo: productoInicial.activo ?? true,
      });
    } else {
      setDatos(VALOR_INICIAL);
    }
    setErrores({});
  }, [productoInicial]);

  const handleChange = (campo) => (e) => {
    const valor = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setDatos({ ...datos, [campo]: valor });
    if (errores[campo]) {
      setErrores({ ...errores, [campo]: null });
    }
  };

  const validar = () => {
    const e = {};
    if (!datos.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    if (datos.nombre.length > 120) e.nombre = 'Máximo 120 caracteres';
    if (datos.descripcion && datos.descripcion.length > 500) e.descripcion = 'Máximo 500 caracteres';
    if (datos.precio === '' || Number(datos.precio) <= 0) e.precio = 'El precio debe ser mayor a 0';
    if (datos.stock === '' || Number(datos.stock) < 0) e.stock = 'El stock no puede ser negativo';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validar()) return;
    onSubmit({
      nombre: datos.nombre.trim(),
      descripcion: datos.descripcion.trim() || null,
      precio: Number(datos.precio),
      stock: Number(datos.stock),
      categoria: datos.categoria.trim() || null,
      activo: datos.activo,
    });
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-row">
        <label>
          Nombre <span className="req">*</span>
          <input
            type="text"
            value={datos.nombre}
            onChange={handleChange('nombre')}
            disabled={enviando}
          />
          {errores.nombre && <span className="form-error">{errores.nombre}</span>}
        </label>
      </div>

      <div className="form-row">
        <label>
          Descripción
          <textarea
            rows={3}
            value={datos.descripcion}
            onChange={handleChange('descripcion')}
            disabled={enviando}
          />
          {errores.descripcion && <span className="form-error">{errores.descripcion}</span>}
        </label>
      </div>

      <div className="form-grid-3">
        <label>
          Precio <span className="req">*</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={datos.precio}
            onChange={handleChange('precio')}
            disabled={enviando}
          />
          {errores.precio && <span className="form-error">{errores.precio}</span>}
        </label>
        <label>
          Stock <span className="req">*</span>
          <input
            type="number"
            min="0"
            value={datos.stock}
            onChange={handleChange('stock')}
            disabled={enviando}
          />
          {errores.stock && <span className="form-error">{errores.stock}</span>}
        </label>
        <label>
          Categoría
          <input
            type="text"
            value={datos.categoria}
            onChange={handleChange('categoria')}
            disabled={enviando}
          />
        </label>
      </div>

      {productoInicial && (
        <div className="form-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={datos.activo}
              onChange={handleChange('activo')}
              disabled={enviando}
            />
            Producto activo (visible en el catálogo)
          </label>
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancelar} disabled={enviando}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? 'Guardando...' : (productoInicial ? 'Guardar cambios' : 'Crear producto')}
        </button>
      </div>
    </form>
  );
}
