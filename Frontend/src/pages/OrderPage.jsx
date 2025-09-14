import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import "../styles/order.css";

export default function OrderPage() {
  const { id } = useParams(); // id del pedido
  const [order, setOrder] = useState(null);
  const [menu, setMenu] = useState([]);
  const nav = useNavigate();

  // Cargar pedido y menú
  useEffect(() => {
    api.get(`/orders/${id}`).then((res) => setOrder(res.data));
    api.get(`/menu_item`).then((res) => setMenu(res.data));
  }, [id]);

  const handleAddItem = async (menuItem) => {
    try {
      const res = await api.post(`/orders/${id}/items`, {
        menu_item_id: menuItem.id,
        qty: 1,
        unit_price: menuItem.price,
      });
      setOrder((prev) => ({
        ...prev,
        items: [...prev.items, res.data],
      }));
    } catch (err) {
      alert("Error al agregar ítem: " + err.message);
    }
  };

  const handleCloseOrder = async () => {
    if (window.confirm("¿Cerrar el pedido?")) {
      await api.patch(`/orders/${id}/close`);
      alert("Pedido cerrado correctamente");
      nav("/tables");
    }
  };

  if (!order) return <p>Cargando pedido...</p>;

  return (
    <div className="order-page">
      <header>
        <h2>Mesa {order.table_code}</h2>
        <p>Estado: {order.status}</p>
      </header>

      <section className="order-items">
        <h3>Items en el pedido</h3>
        {order.items.length === 0 && <p>No hay ítems aún.</p>}
        <ul>
          {order.items.map((item) => (
            <li key={item.id}>
              {item.menu_name} x{item.qty} — ₡{item.total}
            </li>
          ))}
        </ul>
      </section>

      <section className="menu-section">
        <h3>Agregar platillos/bebidas</h3>
        <div className="menu-grid">
          {menu.map((m) => (
            <div key={m.id} className="menu-card" onClick={() => handleAddItem(m)}>
              <p><b>{m.name}</b></p>
              <p>₡{m.price}</p>
              <span className={`tag ${m.type.toLowerCase()}`}>{m.type}</span>
            </div>
          ))}
        </div>
      </section>

      {order.status === "OPEN" && (
        <button className="close-btn" onClick={handleCloseOrder}>
          Cerrar pedido
        </button>
      )}
    </div>
  );
}
