import { NavLink } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';

export default function Navbar() {
  const { cantidadItems } = useCarrito();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" className="brand">
          <span className="brand-icon">🌿</span>
          <span className="brand-text">EcoMarket</span>
        </NavLink>
        <nav className="nav-links">
          <NavLink to="/" end>Catálogo</NavLink>
          <NavLink to="/admin/productos">Gestión</NavLink>
          <NavLink to="/ordenes">Mis órdenes</NavLink>
          <NavLink to="/carrito" className="nav-carrito">
            Carrito
            {cantidadItems > 0 && <span className="badge">{cantidadItems}</span>}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
