# EcoMarket — Backend

**Trabajo Práctico Integrador — Taller de Construcción de Software (INF243)**
Universidad Siglo 21 — 2026 — Período 1B

API REST de la plataforma de comercio electrónico sostenible **EcoMarket**, desarrollada con **Spring Boot 3.3 + Spring Data JPA + MySQL**.

---

## 1. Requisitos previos

- **Java 17 o superior** (recomendado: Java 17 LTS o Java 21).
- **Maven 3.8+** *(opcional si se usa el wrapper `./mvnw`).*
- **MySQL 8** *(opcional)* — el proyecto trae un perfil `dev` con H2 en memoria que permite levantarlo sin instalar nada.

Verificar versiones:

```bash
java -version
mvn -v
```

---

Cómo levantar el backend

Perfil `dev` (H2 en memoria) — 

```bash
cd ecomarket-fullstack\backend
mvn clean
mvn spring-boot:run
```

La aplicación queda disponible en `http://localhost:8080`.

Consola web de H2 para inspeccionar la base: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:ecomarket`
- Usuario: `sa`
- Contraseña: *(vacía)*

---

## 3. Arquitectura

Patrón de capas estándar de Spring:

```
controller   →   service   →   repository   →   entity (JPA)
     ↑              ↑
     └── recibe/devuelve DTOs ──┘
```

- **`controller/`** — controladores REST. Solo orquestan request/response y delegan al servicio.
- **`service/`** — lógica de negocio (validar stock, calcular totales, snapshot de precios al confirmar órdenes).
- **`repository/`** — interfaces Spring Data JPA (CRUD + queries derivadas).
- **`entity/`** — entidades JPA mapeadas a las tablas MySQL.
- **`dto/`** — contratos de entrada/salida de la API (desacopla el modelo interno del JSON público).
- **`exception/`** — excepciones de negocio y *handler* global que devuelve errores JSON consistentes.
- **`config/`** — configuración de CORS para el frontend React.

### Modelo de datos

```
Producto (1) ──── (N) ItemCarrito (N) ──── (1) Carrito
Producto (0..1) ── (N) ItemOrden    (N) ──── (1) Orden
```

- **`Producto`**: catálogo. `activo=false` actúa como *soft delete*.
- **`Carrito`**: contenedor temporal de ítems. Una vez `confirmado=true` no se puede modificar.
- **`ItemCarrito`**: producto + cantidad dentro de un carrito.
- **`Orden`**: snapshot inmutable de una compra confirmada (fecha, mensaje, total).
- **`ItemOrden`**: copia el **nombre** y el **precio unitario** del producto en el momento de la compra. Esto permite borrar/modificar productos sin romper el historial de órdenes.

### Decisiones de diseño relevantes

1. **DTOs separados de entidades** — evita exponer detalles del ORM en la API y permite evolucionarlos por separado.
2. **Snapshot de precio en `ItemOrden`** — un producto puede cambiar de precio o ser eliminado, pero las órdenes pasadas siguen siendo válidas.
3. **Soft delete en `Producto`** — elimina lógicamente sin romper integridad referencial con órdenes históricas.
4. **Validación con `@Valid` + Jakarta Bean Validation** — las reglas viven declarativamente en los DTOs.
5. **`GlobalExceptionHandler`** — toda la API responde con un único formato `ErrorDTO` (timestamp, status, mensaje, detalles), con el código HTTP que corresponde a cada caso.

---

## 4. Endpoints de la API

Base: `http://localhost:8080`

### Productos

| Método | Endpoint                | Descripción                                | Códigos |
|--------|-------------------------|--------------------------------------------|---------|
| GET    | `/api/productos`        | Lista todos los productos activos          | 200     |
| GET    | `/api/productos/{id}`   | Obtiene un producto por id                 | 200, 404|
| POST   | `/api/productos`        | Crea un producto                           | 201, 400|
| PUT    | `/api/productos/{id}`   | Actualiza un producto                      | 200, 400, 404|
| DELETE | `/api/productos/{id}`   | Elimina (soft) un producto                 | 204, 404|

### Carrito

| Método | Endpoint                                    | Descripción                          | Códigos |
|--------|---------------------------------------------|--------------------------------------|---------|
| POST   | `/api/carritos`                             | Crea un carrito vacío                | 201     |
| GET    | `/api/carritos/{id}`                        | Obtiene el carrito con total         | 200, 404|
| POST   | `/api/carritos/{id}/items`                  | Agrega un producto al carrito        | 200, 400, 404, 409|
| PUT    | `/api/carritos/{id}/items/{itemId}`         | Modifica la cantidad de un ítem      | 200, 400, 404, 409|
| DELETE | `/api/carritos/{id}/items/{itemId}`         | Elimina un ítem del carrito          | 200, 404, 409|

### Órdenes

| Método | Endpoint              | Descripción                                  | Códigos |
|--------|-----------------------|----------------------------------------------|---------|
| POST   | `/api/ordenes`        | Confirma un carrito como orden de compra     | 201, 400, 404, 409|
| GET    | `/api/ordenes`        | Historial de órdenes (más recientes primero) | 200     |
| GET    | `/api/ordenes/{id}`   | Obtiene una orden por id                     | 200, 404|

### Ejemplos de payloads

**Crear producto** (`POST /api/productos`):
```json
{
  "nombre": "Cepillo de bambú",
  "descripcion": "Cepillo biodegradable",
  "precio": 1500.00,
  "stock": 100,
  "categoria": "Higiene"
}
```

**Agregar ítem al carrito** (`POST /api/carritos/{id}/items`):
```json
{ "productoId": 1, "cantidad": 2 }
```

**Confirmar orden** (`POST /api/ordenes`):
```json
{ "carritoId": 1, "mensaje": "Entregar después de las 18hs" }
```

---

## 5. Probar con Postman

La colección está en `postman/EcoMarket.postman_collection.json`.

1. Abrir Postman → *Import* → seleccionar el archivo.
2. La colección viene con la variable `{{baseUrl}}` apuntando a `http://localhost:8080`.
3. El orden sugerido para probar el flujo completo:
   1. **Productos / Listar productos** — comprobar que cargaron los 8 productos seed.
   2. **Carrito / Crear carrito** — guarda automáticamente el `id` en `{{carritoId}}`.
   3. **Carrito / Agregar item al carrito** — guarda automáticamente el primer item en `{{itemId}}`.
   4. **Carrito / Ver carrito** — verificar total calculado.
   5. **Carrito / Modificar cantidad de item** — ej. cambiar a 5.
   6. **Órdenes / Confirmar orden** — devuelve la orden creada.
   7. **Órdenes / Historial de órdenes** — verificar que aparece.

Las requests "Crear carrito", "Agregar item" y "Confirmar orden" tienen scripts de tests que guardan los IDs en las variables de la colección, por lo que se pueden ejecutar en cadena.

---

## 6. CORS

Configurado en `com.ecomarket.config.CorsConfig` para permitir orígenes locales del frontend React:
- `http://localhost:5173` (Vite)
- `http://localhost:3000` (Create React App)

Métodos permitidos: GET, POST, PUT, DELETE, PATCH, OPTIONS.

Si el frontend corre en otro origen, basta con agregarlo a la lista `allowedOrigins`.

---

## 7. Uso de IA en este entregable

Conforme al punto 7 del enunciado, se declara el uso de IA generativa:

- **Herramienta**: Claude (Anthropic).
- **Alcance**: se utilizó como asistente para debuggear archivos Java (resolver errores de compilación y excepciones en tiempo de ejecución) y para tareas puntuales de configuración de Spring Boot (perfiles de aplicación, CORS, propiedades de JPA y conexión a la base de datos).
- **Verificación**: todo el código fue revisado, ajustado y probado por el grupo. Las decisiones de diseño (snapshot de precios, soft delete, separación DTO/entidad) están explicadas en este README y se pueden justificar en la defensa oral.

---

## 8. Estructura del repositorio

```
ecomarket-backend/
├── pom.xml
├── README.md
├── postman/
│   └── EcoMarket.postman_collection.json
└── src/main/
    ├── java/com/ecomarket/
    │   ├── EcoMarketApplication.java
    │   ├── config/CorsConfig.java
    │   ├── controller/        (ProductoController, CarritoController, OrdenController)
    │   ├── dto/               (ProductoDTO, CarritoDTO, ItemCarritoDTO, AgregarItemDTO,
    │   │                       ActualizarItemDTO, ConfirmarOrdenDTO, OrdenDTO,
    │   │                       ItemOrdenDTO, ErrorDTO)
    │   ├── entity/            (Producto, Carrito, ItemCarrito, Orden, ItemOrden)
    │   ├── exception/         (ResourceNotFoundException, BusinessException,
    │   │                       GlobalExceptionHandler)
    │   ├── repository/        (ProductoRepository, CarritoRepository,
    │   │                       ItemCarritoRepository, OrdenRepository)
    │   └── service/           (ProductoService, CarritoService, OrdenService)
    └── resources/
        ├── application.properties
        ├── application-dev.properties
        ├── application-prod.properties
        └── data.sql
```

---

## 9. Comandos útiles

```bash
# Levantar en modo desarrollo (H2)
mvn spring-boot:run

# Levantar en modo prod (MySQL)
mvn spring-boot:run -Dspring-boot.run.profiles=prod

# Empaquetar JAR ejecutable
mvn clean package
java -jar target/ecomarket-backend-1.0.0.jar

# Limpiar build
mvn clean
```
