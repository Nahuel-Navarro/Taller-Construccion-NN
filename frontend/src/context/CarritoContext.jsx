import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { carritoApi } from '../api/ecomarket';

const STORAGE_KEY = 'ecomarket_carrito_id';
const CarritoContext = createContext(null);

export function CarritoProvider({ children }) {
  const [carritoId, setCarritoId] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? Number(stored) : null;
  });
  const [carrito, setCarrito] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (carritoId === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, String(carritoId));
    }
  }, [carritoId]);

  const refrescar = useCallback(async () => {
    if (!carritoId) {
      setCarrito(null);
      return;
    }
    setCargando(true);
    try {
      const data = await carritoApi.obtener(carritoId);
      if (data.confirmado) {
        setCarritoId(null);
        setCarrito(null);
      } else {
        setCarrito(data);
      }
    } catch (err) {
      if (err.status === 404) {
        setCarritoId(null);
        setCarrito(null);
      } else {
        throw err;
      }
    } finally {
      setCargando(false);
    }
  }, [carritoId]);

  useEffect(() => {
    refrescar();
  }, [refrescar]);

  const obtenerOCrearCarrito = useCallback(async () => {
    if (carritoId) return carritoId;
    const nuevo = await carritoApi.crear();
    setCarritoId(nuevo.id);
    return nuevo.id;
  }, [carritoId]);

  const agregarProducto = useCallback(async (productoId, cantidad) => {
    const id = await obtenerOCrearCarrito();
    const actualizado = await carritoApi.agregarItem(id, productoId, cantidad);
    setCarrito(actualizado);
    return actualizado;
  }, [obtenerOCrearCarrito]);

  const actualizarCantidad = useCallback(async (itemId, cantidad) => {
    if (!carritoId) return;
    const actualizado = await carritoApi.actualizarItem(carritoId, itemId, cantidad);
    setCarrito(actualizado);
  }, [carritoId]);

  const eliminarItem = useCallback(async (itemId) => {
    if (!carritoId) return;
    const actualizado = await carritoApi.eliminarItem(carritoId, itemId);
    setCarrito(actualizado);
  }, [carritoId]);

  const limpiarCarrito = useCallback(() => {
    setCarritoId(null);
    setCarrito(null);
  }, []);

  const cantidadItems = carrito?.cantidadItems ?? 0;

  const value = {
    carrito,
    carritoId,
    cargando,
    cantidadItems,
    agregarProducto,
    actualizarCantidad,
    eliminarItem,
    limpiarCarrito,
    refrescar,
  };

  return <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>;
}

export function useCarrito() {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  return ctx;
}
