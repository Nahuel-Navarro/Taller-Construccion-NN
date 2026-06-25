# EcoMarket — Frontend

**Trabajo Práctico Integrador — Taller de Construcción de Software (INF243)**
Universidad Siglo 21 — 2026 — Período 1B

Frontend de la plataforma EcoMarket, desarrollado con **React 18 + Vite + React Router**. Consume la API REST del backend Spring Boot.

---

## 1. Requisitos previos

- **Node.js 18 o superior** (recomendado: 20 LTS).
- **npm** (viene incluido con Node).
- El **backend** corriendo en `http://localhost:8080` (ver `ecomarket-backend/README.md`).

Verificar versiones:

```bash
node -v
npm -v
```

---

## 2. Cómo levantar el frontend

Primera vez: instalar dependencias.

```bash
npm install
```

Después, levantar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:5173` (el navegador se abre solo).

Para generar el build de producción:

```bash
npm run build
npm run preview
```

---

## 3. Flujo de la aplicación

1. **Catálogo (`/`)** — listado de productos con filtro por nombre y por categoría. Cada tarjeta tiene botón "Agregar" que suma una unidad al carrito.
2. **Detalle de producto (`/productos/:id`)** — vista expandida con selector de cantidad.
3. **Gestión (`/admin/productos`)** — tabla CRUD: alta, edición y baja (soft delete) de productos.
4. **Carrito (`/carrito`)** — ítems con selector de cantidad, total calculado, campo de mensaje opcional y botón de confirmación.
5. **Órdenes (`/ordenes`)** — historial de pedidos confirmados, del más reciente al más viejo.
6. **Detalle de orden (`/ordenes/:id`)** — snapshot inmutable: items, precios y total tal como estaban al confirmar.

---

## 4. Estructura del código

```
src/
├── main.jsx                   Punto de entrada
├── App.jsx                    Router + providers (Carrito, Toast)
├── styles.css                 Estilos globales
├── api/
│   └── ecomarket.js           Cliente HTTP: productos, carrito, órdenes
├── context/
│   └── CarritoContext.jsx     Estado del carrito (persistido en localStorage)
├── components/
│   ├── Navbar.jsx             Barra superior con contador del carrito
│   ├── ProductoCard.jsx       Tarjeta de producto
│   ├── ProductoForm.jsx       Formulario controlado (crear/editar)
│   ├── CarritoItem.jsx        Item del carrito con selector de cantidad
│   ├── Modal.jsx              Modal de confirmación reutilizable
│   └── Toast.jsx              Notificaciones (provider + hook)
└── pages/
    ├── CatalogoPage.jsx
    ├── ProductoDetallePage.jsx
    ├── AdminProductosPage.jsx
    ├── ProductoFormPage.jsx   Crear y editar comparten esta página
    ├── CarritoPage.jsx
    ├── OrdenesPage.jsx
    └── OrdenDetallePage.jsx
```

---

## 5. Decisiones de diseño

### 5.1. Componentes funcionales + Hooks

Toda la aplicación está hecha con **componentes funcionales** (no se usan `class components`). Los hooks principales empleados:

- **`useState`** — estado local de cada página (productos, formularios, modales, filtros).
- **`useEffect`** — fetch de datos al montar la página y cleanup mediante una bandera `cancelado` para evitar actualizaciones después del unmount.
- **`useContext`** — para el carrito y para los toasts (estado verdaderamente global).
- **`useCallback`** — para estabilizar las funciones del `CarritoContext` y evitar re-renders innecesarios.
- **`useParams` / `useNavigate`** — de React Router para leer parámetros de URL y navegar.

### 5.2. Flujo unidireccional de datos

Se respeta el patrón unidireccional de React:

- **Padre → hijo via `props`**: las páginas son los "padres" que hacen `fetch` con `useEffect`, y pasan los datos a los componentes hijos (`ProductoCard`, `CarritoItem`, `ProductoForm`) mediante `props`.
- **Hijo → padre via callbacks**: las acciones de los hijos se comunican hacia arriba con `props` tipo `onAgregarCarrito`, `onActualizarCantidad`, `onEliminar`, `onSubmit`, `onCancelar`.

Ejemplo en `CarritoPage`:

```jsx
<CarritoItem
  item={item}                              // dato hacia abajo
  onActualizarCantidad={handleActualizar}  // callback hacia arriba
  onEliminar={handleEliminar}              // callback hacia arriba
/>
```

### 5.3. Estado del carrito

El carrito se maneja en `CarritoContext` por dos razones:

1. Es **estado verdaderamente global**: lo necesita la `Navbar` (contador), el `CarritoPage` (items y total), las páginas de producto (agregar al carrito).
2. **Persistencia**: el `carritoId` se guarda en `localStorage`. Si el usuario recarga la página, el carrito sigue ahí (mientras no haya sido confirmado).

El backend siempre es la fuente de verdad: cada acción (agregar, actualizar, eliminar) refresca el estado local con la respuesta del servidor.

### 5.4. Manejo de errores

El cliente HTTP (`api/ecomarket.js`) lanza un `Error` con el `mensaje` que devuelve el `GlobalExceptionHandler` del backend. Las páginas capturan el error y muestran un toast (notificación temporal) al usuario.

Casos típicos:

- Stock insuficiente al agregar al carrito → toast rojo.
- Validación de formulario (precio negativo, stock vacío) → mensaje al lado del campo y toast con los detalles.
- Backend caído → toast con el mensaje de fetch.

### 5.5. Estilos

Se usa **CSS plano** con variables CSS para el sistema de diseño (colores, sombras, radios). La paleta refleja el dominio (productos eco/sostenibles): verde profundo (`#1A472A`), verde primario (`#2C5F2D`), verde claro (`#97BC62`), terracota como acento (`#E8A87C`).

Diseño responsive con `@media` queries: desktop (3-4 columnas), tablet (2 columnas), mobile (1 columna). Sin frameworks de UI: todo nativo para mantener el bundle chico y el control total.

---

## 6. Integración con el backend (CORS)

El backend ya tiene configurado CORS para aceptar requests desde `http://localhost:5173` (Vite). Si el frontend se levanta en otro puerto, hay que ajustar `CorsConfig.java` en el backend.

La URL base del backend se define en `src/api/ecomarket.js`:

```js
const BASE_URL = 'http://localhost:8080';
```

Si querés conectar el frontend a un backend en otra URL (por ejemplo en producción), cambiá esta constante o convertila en una variable de entorno con `import.meta.env`.

---

## 7. Uso de IA en este entregable

Conforme al punto 7 del enunciado, se declara el uso de IA generativa:

- **Herramienta**: Claude (Anthropic).
- **Alcance**: se utilizó como asistente para debuggear archivos JSX (resolver errores de hooks, sintaxis, dependencias de `useEffect`) y para tareas puntuales de configuración de Vite y React Router (estructura de rutas, configuración del dev server).
- **Verificación**: todo el código fue revisado, ajustado y probado por el grupo. Las decisiones de diseño (estructura de componentes, patrón unidireccional, manejo del estado del carrito) están explicadas en este README y se pueden justificar en la defensa oral.

---

## 8. Cómo probar la aplicación de punta a punta

Con el backend y el frontend corriendo:

1. Abrí `http://localhost:5173`. Tenés que ver el catálogo con 8 productos.
2. Hacé click en "Agregar" en un par de productos. Ves el contador del carrito subiendo en la navbar.
3. Entrá al **Carrito**. Vas a ver los ítems con su subtotal y el total general.
4. Cambiá la cantidad con los botones +/− del selector.
5. Escribí un mensaje opcional y hacé click en **Confirmar pedido**.
6. La app te lleva al detalle de la orden con el snapshot inmutable.
7. Entrá a **Mis órdenes** para ver el historial.
8. En **Gestión**, probá crear un producto nuevo, editarlo y eliminarlo.

Para probar manejo de errores:

- Editá un producto y poné stock `0`. Volvé al catálogo: el botón "Agregar" queda deshabilitado y dice "Sin stock".
- En "Gestión", creá un producto con precio `0`. La validación del formulario lo bloquea.
- Apagá el backend y refrescá la página: vas a ver el toast rojo con el error de conexión.

---

## 9. Comandos disponibles

```bash
npm install          # Instala dependencias
npm run dev          # Levanta el servidor de desarrollo en :5173
npm run build        # Genera el build de producción en /dist
npm run preview      # Sirve el build de producción para probarlo
```
