# EcoMarket — Plataforma de Comercio Electrónico Sostenible

**Trabajo Práctico Integrador — Taller de Construcción de Software (INF243)**
Universidad Siglo 21 — 2026 — Período 1B

Aplicación web fullstack para una startup argentina que comercializa productos ecológicos y sostenibles. Cubre catálogo, carrito de compras y confirmación de pedidos.

---

## Estructura del repositorio

```
Taller-Construccion-NN/
├── backend/        API REST con Spring Boot 3.3 + Spring Data JPA + MySQL
└── frontend/       Aplicación React 18 + Vite + React Router
```

Cada carpeta tiene su propio README con detalle técnico:

- [`backend/README.md`](backend/README.md) — arquitectura, modelo de datos, endpoints, colección Postman.
- [`frontend/README.md`](frontend/README.md) — estructura de componentes, hooks, flujo unidireccional.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Java 17, Spring Boot 3.3.4, Spring Data JPA, Hibernate |
| Base de datos | MySQL 8 (perfil prod) o H2 en memoria (perfil dev) |
| Frontend | React 18, Vite, React Router 6 |
| Comunicación | API REST sobre HTTP, JSON |
| Testing API | Postman (colección incluida) |

---

## Cómo levantar la aplicación completa

Se necesitan **dos terminales abiertas**: una para el backend y otra para el frontend. Ambas partes corren de forma independiente y se comunican vía HTTP.

### Terminal 1 — Backend

```bash
cd backend
mvn spring-boot:run
```

Por defecto arranca en `http://localhost:8080` con el perfil `dev` (base H2 en memoria, ya cargada con 8 productos de ejemplo).

Cuando veas en la consola `Started EcoMarketApplication in X.XXX seconds`, el backend está listo.

### Terminal 2 — Frontend

```bash
cd frontend
npm install       # solo la primera vez
npm run dev
```

Arranca en `http://localhost:5173` y abre el navegador automáticamente.

---

## Cómo está integrado

La integración entre frontend y backend se resuelve con tres piezas:

1. **Cliente HTTP único en el frontend** — `frontend/src/api/ecomarket.js` envuelve los 13 endpoints del backend con `fetch`. Toda llamada al backend pasa por este módulo.

2. **CORS configurado en el backend** — `backend/src/main/java/com/ecomarket/config/CorsConfig.java` habilita explícitamente los orígenes `http://localhost:5173` (Vite) y `http://localhost:3000` (CRA), todos los métodos REST (GET, POST, PUT, DELETE, PATCH, OPTIONS) y los headers necesarios. Sin esta configuración el navegador bloquearía las requests por la política same-origin.

3. **Formato de errores unificado** — el backend devuelve errores con un `ErrorDTO` consistente (timestamp, status, mensaje, detalles). El frontend lo captura en un único lugar (el wrapper `request()`) y los muestra como toasts al usuario.

### Diagrama de la integración

```
┌─────────────────────────────┐         ┌─────────────────────────────┐
│  Frontend (React + Vite)    │         │  Backend (Spring Boot)      │
│  http://localhost:5173      │         │  http://localhost:8080      │
│                             │         │                             │
│   Páginas y componentes     │         │   Controllers REST          │
│           ↓                 │  HTTP   │           ↓                 │
│   api/ecomarket.js  ────────┼─────────┼─→  /api/productos           │
│   (fetch)                   │  JSON   │    /api/carritos            │
│                             │         │    /api/ordenes             │
│   CarritoContext (estado)   │         │           ↓                 │
│           ↓                 │         │   Services + Repositories   │
│   localStorage              │         │           ↓                 │
│   (carritoId persistido)    │         │   Base de datos (H2/MySQL)  │
└─────────────────────────────┘         └─────────────────────────────┘
                                 CORS:
                                 backend permite origen :5173
```

---

## Flujo de uso

1. **Catálogo** (`/`) — el usuario ve los 8 productos del catálogo y los puede filtrar por nombre o categoría.
2. **Agregar al carrito** — al hacer click en "Agregar", el frontend llama `POST /api/carritos` (si no hay carrito activo) y luego `POST /api/carritos/{id}/items`. El `carritoId` se guarda en localStorage.
3. **Carrito** (`/carrito`) — muestra los ítems con el total calculado por el backend. El usuario puede modificar cantidades o eliminar ítems.
4. **Confirmación** — al apretar "Confirmar pedido", se llama `POST /api/ordenes` con el `carritoId` y un mensaje opcional. El backend:
   - Valida stock una última vez.
   - Toma snapshot del nombre y precio de cada producto.
   - Descuenta el stock.
   - Marca el carrito como confirmado.
   - Devuelve la orden creada con su id.
5. **Historial** (`/ordenes`) — lista todas las órdenes confirmadas, de la más reciente a la más antigua.
6. **Gestión** (`/admin/productos`) — CRUD completo del catálogo.

---

## Probar la integración end-to-end

Con ambas terminales corriendo, este recorrido valida que todo funciona:

1. Abrí `http://localhost:5173`. El catálogo carga los productos desde el backend.
2. Agregá 2-3 productos al carrito. Observá cómo el badge de la navbar se actualiza en tiempo real.
3. Entrá al carrito y cambiá una cantidad. El total se recalcula con cada cambio (es el backend el que calcula).
4. Escribí un mensaje y confirmá el pedido. La app te lleva al detalle de la orden recién creada.
5. Entrá a "Mis órdenes". Ves el pedido en el historial.
6. Volvé al catálogo. El stock del producto que compraste está descontado.
7. En "Gestión", creá un producto nuevo. Aparece inmediatamente en el catálogo público.
8. Editá un producto y poné stock 0. En el catálogo el botón "Agregar" queda deshabilitado.

Casos de error para probar:

- Agregá más unidades de las que hay en stock → toast rojo con "Stock insuficiente".
- Apagá el backend y refrescá → toast con error de conexión.
- En el formulario de producto, dejá el precio en 0 → validación inline impide enviar.

---

## Uso de IA en este entregable

Conforme al punto 7 del enunciado, se declara el uso de IA generativa:

- **Herramienta**: Claude (Anthropic).
- **Alcance**:
  - **Backend**: asistente para debuggear archivos Java (errores de compilación y excepciones en tiempo de ejecución) y tareas puntuales de configuración de Spring Boot (perfiles de aplicación, CORS, propiedades de JPA y conexión a la base de datos).
  - **Frontend**: asistente para debuggear archivos JSX (errores de hooks, dependencias de `useEffect`, sintaxis) y tareas puntuales de configuración de Vite y React Router (estructura de rutas, configuración del dev server).
- **Verificación**: todo el código fue revisado, ajustado y probado. Las decisiones de diseño (snapshot de precios, soft delete, separación DTO/entidad, flujo unidireccional, manejo del estado del carrito) están documentadas y pueden defenderse oralmente.

---

## Comandos rápidos

```bash
# Backend
cd backend && mvn spring-boot:run                         # Modo dev (H2)
cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=prod   # Modo prod (MySQL)
cd backend && mvn clean package                           # Generar JAR

# Frontend
cd frontend && npm install                                # Primera vez
cd frontend && npm run dev                                # Servidor de desarrollo
cd frontend && npm run build                              # Build de producción
cd frontend && npm run preview                            # Servir el build
```

---

## Estructura completa

```
Taller-Construccion-NN/
├── README.md                              Este archivo
├── backend/
│   ├── README.md                          Documentación del backend
│   ├── pom.xml                            Configuración Maven
│   ├── postman/
│   │   └── EcoMarket.postman_collection.json
│   └── src/main/
│       ├── java/com/ecomarket/
│       │   ├── EcoMarketApplication.java
│       │   ├── config/CorsConfig.java
│       │   ├── controller/                ProductoController, CarritoController, OrdenController
│       │   ├── dto/                       9 DTOs
│       │   ├── entity/                    Producto, Carrito, ItemCarrito, Orden, ItemOrden
│       │   ├── exception/                 GlobalExceptionHandler + 2 excepciones de negocio
│       │   ├── repository/                4 repositorios Spring Data JPA
│       │   └── service/                   ProductoService, CarritoService, OrdenService
│       └── resources/
│           ├── application.properties
│           ├── application-dev.properties
│           ├── application-prod.properties
│           └── data.sql                   8 productos seed
└── frontend/
    ├── README.md                          Documentación del frontend
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── public/
    │   └── leaf.svg                       Favicon
    └── src/
        ├── main.jsx                       Bootstrap
        ├── App.jsx                        Router + providers
        ├── styles.css                     Estilos globales
        ├── api/ecomarket.js               Cliente HTTP
        ├── context/CarritoContext.jsx     Estado del carrito (localStorage)
        ├── components/                    Navbar, ProductoCard, ProductoForm,
        │                                  CarritoItem, Modal, Toast
        └── pages/                         Catálogo, ProductoDetalle, AdminProductos,
                                           ProductoForm, Carrito, Órdenes, OrdenDetalle
```
