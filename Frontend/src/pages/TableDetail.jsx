import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function TableDetail() {
  const { id } = useParams(); // id de la mesa
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        // Buscar si ya hay pedido abierto
        const r = await axios.get(`http://localhost:4000/api/orders/table/${id}/open`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (r.data) {
          setOrder(r.data);
        } else {
          // Si no hay, crear uno nuevo
          const newOrder = await axios.post(`http://localhost:4000/api/orders`, 
            { table_id: id },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setOrder(newOrder.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [id, token]);

  if (!order) return <p>Cargando pedido...</p>;

  return (
    <div className="container my-4">
      <h2>Mesa #{id} - Pedido #{order.id}</h2>
      <p>Estado: {order.status}</p>

      <button
        className="btn btn-primary mt-3"
        onClick={() => navigate(`/orders/${order.id}`)}
      >
        Agregar productos
      </button>
    </div>
  );
}

export default TableDetail;
