const BASE_URL = 'http://localhost:8080';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.mensaje || `Error ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.detalles = data?.detalles;
    throw error;
  }

  return data;
}

export const productosApi = {
  listar: () => request('/api/productos'),
  obtener: (id) => request(`/api/productos/${id}`),
  crear: (producto) => request('/api/productos', {
    method: 'POST',
    body: JSON.stringify(producto),
  }),
  actualizar: (id, producto) => request(`/api/productos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(producto),
  }),
  eliminar: (id) => request(`/api/productos/${id}`, { method: 'DELETE' }),
};

export const carritoApi = {
  crear: () => request('/api/carritos', { method: 'POST' }),
  obtener: (id) => request(`/api/carritos/${id}`),
  agregarItem: (carritoId, productoId, cantidad) => request(
    `/api/carritos/${carritoId}/items`,
    { method: 'POST', body: JSON.stringify({ productoId, cantidad }) }
  ),
  actualizarItem: (carritoId, itemId, cantidad) => request(
    `/api/carritos/${carritoId}/items/${itemId}`,
    { method: 'PUT', body: JSON.stringify({ cantidad }) }
  ),
  eliminarItem: (carritoId, itemId) => request(
    `/api/carritos/${carritoId}/items/${itemId}`,
    { method: 'DELETE' }
  ),
};

export const ordenesApi = {
  confirmar: (carritoId, mensaje) => request('/api/ordenes', {
    method: 'POST',
    body: JSON.stringify({ carritoId, mensaje }),
  }),
  listar: () => request('/api/ordenes'),
  obtener: (id) => request(`/api/ordenes/${id}`),
};
