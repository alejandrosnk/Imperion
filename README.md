# Restaurant Management System

Sistema web para la **gestión de restaurantes**, desarrollado con:

- **Backend**: Node.js + Express + PostgreSQL  
- **Frontend**: React + Vite + Bootstrap 5  
- **Autenticación**: JWT + Context API (roles `ADMIN` y `WAITER`)  

---

## Estructura del Proyecto
---
```
│
├── API/ # Backend (Node.js + Express + PostgreSQL)
│ ├── config/ # Configuración DB
│ │ └── db.js
│ ├── controllers/ # Controladores
│ │ ├── order.controller.js
│ │ ├── payment.controller.js
│ │ ├── table.controller.js
│ │ └── user.controller.js
│ ├── middlewares/ # Autenticación y roles
│ │ └── auth.middleware.js
│ ├── routes/ # Endpoints REST
│ │ ├── order.routes.js
│ │ ├── payment.routes.js
│ │ ├── table.routes.js
│ │ └── user.routes.js
│ ├── server.js # Punto de entrada
│ └── package.json
│
├── Frontend/ # Frontend (React + Vite)
│ ├── src/
│ │ ├── components/ # Navbar, Footer, TableCard, etc.
│ │ ├── context/ # AuthContext
│ │ ├── pages/ # Vistas principales
│ │ │ ├── Dashboard.jsx
│ │ │ ├── TablesPage.jsx
│ │ │ ├── OrderPage.jsx
│ │ │ ├── OrderDetail.jsx
│ │ │ ├── PaymentPage.jsx
│ │ │ ├── PaymentsList.jsx
│ │ │ ├── MenuList.jsx
│ │ │ ├── MenuForm.jsx
│ │ ├── services/ # API calls
│ │ │ ├── api.js
│ │ │ ├── paymentApi.js
│ │ │ └── orderApi.js
│ │ ├── styles/ # Estilos CSS
│ │ ├── App.jsx
│ │ └── main.jsx
│ └── package.json
│
└── README.md
```
---

## Script de base de datos
``` SQL
-- ==========================
-- Tabla de Usuarios
-- ==========================
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN','WAITER')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================
-- Sesiones de Autenticación
-- ==========================
CREATE TABLE IF NOT EXISTS sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- ==========================
-- Mesas
-- ==========================
CREATE TABLE IF NOT EXISTS tables (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('FREE','OCCUPIED','CLEANING'))
);

-- ==========================
-- Pedidos
-- ==========================
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    waiter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    table_id BIGINT NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('OPEN','PAID')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

-- ==========================
-- Items del Menú
-- ==========================
CREATE TABLE IF NOT EXISTS menu_item (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('FOOD','DRINK')),
    price NUMERIC(10,2) NOT NULL CHECK (price > 0),
    available BOOLEAN DEFAULT TRUE
);

-- ==========================
-- Items dentro de un Pedido
-- ==========================
CREATE TABLE IF NOT EXISTS order_item (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id BIGINT NOT NULL REFERENCES menu_item(id),
    qty INT NOT NULL CHECK (qty > 0),
    unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price > 0),
    total NUMERIC(10,2) GENERATED ALWAYS AS (qty * unit_price) STORED
);

-- ==========================
-- Pagos realizados
-- ==========================
CREATE TABLE IF NOT EXISTS payment (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    method VARCHAR(10) NOT NULL CHECK (method IN ('CASH','CARD','SINPE')),
    paid_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================
-- Asociación pago ↔ items pagados
-- ==========================
CREATE TABLE IF NOT EXISTS payment_item (
    id BIGSERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL REFERENCES payment(id) ON DELETE CASCADE,
    order_item_id BIGINT NOT NULL REFERENCES order_item(id) ON DELETE CASCADE
);
```
## Scripts frontend:
``` bash
# Instalar dependencias
cd Frontend
npm install

# Ejecutar aplicación
npm run dev
```
## Scripts backend:
``` bash
# Instalar dependencias
cd API
npm install

# Iniciar servidor en desarrollo
node server.js
```
