import { useEffect, useState } from "react";
import { getPayments } from "../services/paymentApi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function PaymentsList() {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getPayments(token);
        setPayments(data.rows || []); // ✅ usar rows del backend
      } catch (err) {
        setError(err.response?.data?.message || "Error cargando pagos");
      }
    }
    load();
  }, [token]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="container my-3">
        <Link to="/dashboard" className="btn-icon" title="Volver al dashboard">
          <i className="fa-solid fa-right-to-bracket fa-lg"></i>
        </Link>
      </div>
      <main className="container my-4 flex-grow-1">
        <h2 className="mb-3">Pagos</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <table className="table table-striped table-bordered align-middle">
          <thead className="table-dark">
            <tr>
              <th>Pedido</th>
              <th>Monto</th>
              <th>Método</th>
              <th>Pagado por</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((p) => (
                <tr key={p.id}>
                  <td>{p.order_id}</td>
                  <td>₡{parseFloat(p.amount).toFixed(2)}</td>
                  <td>
                    <span
                      className={`badge ${
                        p.method === "CASH"
                          ? "bg-success"
                          : p.method === "CARD"
                          ? "bg-primary"
                          : "bg-info"
                      }`}
                    >
                      {p.method}
                    </span>
                  </td>
                  <td>{p.paid_by_name || "-"}</td>
                  <td>{new Date(p.created_at).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  Sin pagos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
      <Footer />
    </div>
  );
}
