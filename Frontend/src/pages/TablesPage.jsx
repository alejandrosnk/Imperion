import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import TableCard from "../components/TableCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/tables.css";
import { useAuth } from "../context/AuthContext";

export default function TablesPage() {
  const [tables, setTables] = useState([]);
  const nav = useNavigate();
  const { token } = useAuth();

  const fetchTables = async () => {
    try {
      const res = await api.get("/tables", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTables(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [token]);

  // Cuando se hace click en una mesa
  const handleSelect = async (table) => {
    try {
      if (table.status === "FREE") {
        // crear nuevo pedido
        const res = await api.post(
          "/orders",
          { table_id: table.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        nav(`/orders/${res.data.id}`);
      } else if (table.status === "OCCUPIED") {
        // ir directamente al pedido activo de la mesa
        const res = await api.get(`/orders/by-table/${table.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data) {
          nav(`/orders/${res.data.id}`);
        } else {
          alert("No se encontró pedido abierto para esta mesa");
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error procesando mesa");
    }
  };

  // Cuando se libera una mesa en estado CLEANING → pasa a FREE
  const handleFreeTable = async (table) => {
    try {
      await api.patch(
        `/tables/${table.id}`,
        { status: "FREE" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTables(); // refrescar estado
    } catch (err) {
      alert(err.response?.data?.message || "Error liberando mesa");
    }
  };

  return (
     <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="container my-3">
        <Link to="/dashboard" className="btn-icon" title="Volver a pedidos">
          <i className="fa-solid fa-right-to-bracket fa-lg"></i>
        </Link>
      </div>
      <div className="tables-page">
        <h2 className="mb-4">Mesas del restaurante</h2>
        <div className="tables-grid">
          {tables.map((t) => (
            <TableCard
              key={t.id}
              table={t}
              onSelect={handleSelect}
              onFree={handleFreeTable}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
