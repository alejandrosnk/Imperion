import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

function OrdersList() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await api.get("/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Error cargando pedidos");
      }
    }
    loadOrders();
  }, [token]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
        <div className="container my-3">
          <Link to="/dashboard" className="btn-icon" title="Volver al dashboard">
            <i className="fa-solid fa-right-to-bracket fa-lg"></i>
          </Link>
        </div>
        <div className="container my-4">
          <h2 className="mb-3">Pedidos</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <table className="table table-striped table-bordered align-middle">
            <thead className="table-dark">
              <tr>
                <th>Mesa</th>
                <th>Estado</th>
                <th>Mesero</th>
                <th>Creado</th>
                <th>Cerrado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.table_code}</td>
                    <td>
                      <span
                        className={`badge ${
                          o.status === "OPEN"
                            ? "bg-warning"
                            : o.status === "PAID"
                            ? "bg-success"
                            : o.status === "CANCELLED"
                            ? "bg-danger"
                            : "bg-info"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td>{o.waiter}</td>
                    <td>{new Date(o.created_at).toLocaleString()}</td>
                    <td>{o.closed_at ? new Date(o.closed_at).toLocaleString() : "-"}</td>
                    <td>
                      <Link to={`/orders/${o.id}`} className="btn btn-sm btn-primary">
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    Sin pedidos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      <Footer />
    </div>
  );
}

export default OrdersList;
