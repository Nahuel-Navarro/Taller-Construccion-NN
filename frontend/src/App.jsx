import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CarritoProvider } from './context/CarritoContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import CatalogoPage from './pages/CatalogoPage';
import ProductoDetallePage from './pages/ProductoDetallePage';
import AdminProductosPage from './pages/AdminProductosPage';
import ProductoFormPage from './pages/ProductoFormPage';
import CarritoPage from './pages/CarritoPage';
import OrdenesPage from './pages/OrdenesPage';
import OrdenDetallePage from './pages/OrdenDetallePage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CarritoProvider>
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<CatalogoPage />} />
              <Route path="/productos/nuevo" element={<ProductoFormPage />} />
              <Route path="/productos/:id/editar" element={<ProductoFormPage />} />
              <Route path="/productos/:id" element={<ProductoDetallePage />} />
              <Route path="/admin/productos" element={<AdminProductosPage />} />
              <Route path="/carrito" element={<CarritoPage />} />
              <Route path="/ordenes" element={<OrdenesPage />} />
              <Route path="/ordenes/:id" element={<OrdenDetallePage />} />
              <Route path="*" element={
                <div className="container">
                  <div className="estado-vacio-grande">
                    <div className="estado-vacio-emoji">🌿</div>
                    <p>Página no encontrada</p>
                  </div>
                </div>
              } />
            </Routes>
          </main>
          <footer className="footer">
            <div className="container">
              EcoMarket · Plataforma de Comercio Electrónico Sostenible
            </div>
          </footer>
        </CarritoProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
