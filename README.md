# 🍽️ Restaurant Management System

Sistema web completo para la **gestión de restaurantes**, desarrollado con **Node.js (Express)** en el backend y **React** en el frontend.  
Permite administrar mesas, pedidos, productos del menú y pagos parciales o totales.

---

## 📌 Características principales

- **Gestión de mesas**
  - Estados: `FREE`, `OCCUPIED`, `CLEANING`.
  - Liberación de mesas al terminar pedidos.
- **Pedidos**
  - Crear pedidos por mesa.
  - Agregar ítems del menú.
  - Control de estados: `OPEN`, `PAID`.
- **Menú**
  - Platillos y bebidas con tipo y precio.
- **Pagos**
  - Soporte de métodos: `CASH`, `CARD`, `SINPE`.
  - Pagos parciales seleccionando productos específicos.
  - Cierre automático de pedido cuando se alcanza el monto total.
- **Roles de usuario**
  - **Admin**: puede ver todos los pedidos y pagos.
  - **Mesero**: solo puede ver y gestionar sus pedidos.

---

## 🛠️ Tecnologías utilizadas

### Backend
- Node.js + Express
- PostgreSQL
- JWT para autenticación
- Bcrypt para encriptar contraseñas

### Frontend
- React + React Router DOM
- Context API para autenticación
- Bootstrap 5 para estilos

---

## ⚙️ Instalación

### 1. Clonar repositorio
```bash
git clone https://github.com/tuusuario/restaurant-system.git
cd restaurant-system
