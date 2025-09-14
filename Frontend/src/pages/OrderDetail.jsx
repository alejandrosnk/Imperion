import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api.js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

function OrderDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Para agregar ítems
  const [menu, setMenu] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);

  async function fetchOrder() {
    try {
      const res = await api.get(`/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error cargando detalle");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrder();
  }, [id, token]);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await api.get("/menu", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMenu(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchMenu();
  }, [token]);

  const handleCloseOrder = async () => {
    try {
      await api.patch(
        `/orders/${id}/close`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Pedido cerrado correctamente");
      navigate("/tables");
    } catch (err) {
      alert(err.response?.data?.message || "Error cerrando pedido");
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        `/orders/${id}/items`,
        {
          menu_item_id: selectedItem,
          qty,
          unit_price: price,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedItem("");
      setQty(1);
      setPrice(0);
      fetchOrder(); // refrescar pedido
    } catch (err) {
      alert(err.response?.data?.message || "Error agregando producto");
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="container my-3">
        <Link to="/tables" className="btn-icon" title="Volver a pedidos">
          <i className="fa-solid fa-right-to-bracket fa-lg"></i>
        </Link>
      </div>
      <div className="container my-4">
        <h2>Detalle Pedido #{order.id}</h2>

        <div className="mb-3">
          <p><strong>Mesa:</strong> {order.table_code}</p>
          <p><strong>Mesero:</strong> {order.waiter}</p>
          <p>
            <strong>Estado:</strong>{" "}
            <span
              className={`badge ${
                order.status === "OPEN"
                  ? "bg-warning"
                  : order.status === "PAID"
                  ? "bg-success"
                  : "bg-secondary"
              }`}
            >
              {order.status}
            </span>
          </p>
          <p><strong>Creado:</strong> {new Date(order.created_at).toLocaleString()}</p>
          <p><strong>Cerrado:</strong> {order.closed_at ? new Date(order.closed_at).toLocaleString() : "-"}</p>
        </div>

        <h4>Productos</h4>
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Producto</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Precio unitario</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.length > 0 ? (
              order.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.menu_name}</td>
                  <td>{item.type}</td>
                  <td>{item.qty}</td>
                  <td>{item.unit_price.toFixed(2)}</td>
                  <td>{item.total.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">Sin ítems</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Formulario para agregar productos */}
        {order.status === "OPEN" && (
          <div className="card mt-4">
            <div className="card-body">
              <h5 className="card-title">Agregar producto</h5>
              <form onSubmit={handleAddItem}>
                <div className="row g-2 align-items-end">
                  <div className="col-md-5">
                    <label className="form-label">Producto</label>
                    <select
                      className="form-select"
                      value={selectedItem}
                      onChange={(e) => {
                        const id = e.target.value;
                        setSelectedItem(id);
                        const item = menu.find((m) => m.id == id);
                        setPrice(item?.price || 0);
                      }}
                      required
                    >
                      <option value="">Seleccione...</option>
                      {menu.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.type})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Cantidad</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Precio unitario</label>
                    <input
                      type="number"
                      className="form-control"
                      value={price}
                      readOnly
                    />
                  </div>
                  <div className="col-md-2">
                    <button className="btn btn-primary w-100">Agregar</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {order.status === "OPEN" && (
          <button onClick={() => navigate(`/orders/${order.id}/pay`)} className="btn btn-success mt-3">
            Pagar pedido
          </button>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default OrderDetail;
