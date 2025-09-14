import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMenu, softDeleteMenu } from "../services/menuApi";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/menu.css";

export default function MenuList() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");     // '', DISH, DRINK
  const [active, setActive] = useState("true"); // true | false | ''
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const canEdit = user?.role === "ADMIN";

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const params = {
        q: q || undefined,
        type: type || undefined,
        active: active === "" ? undefined : active,
      };
      const data = await fetchMenu(params);
      setItems(data);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Error cargando productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const onSearch = (e) => {
    e.preventDefault();
    load();
  };

  const onDelete = async (id, name) => {
    if (!canEdit) return;
    if (!window.confirm(`¿Inactivar "${name}"?`)) return;
    try {
      await softDeleteMenu(id);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "No se pudo inactivar");
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="container my-3">
        <Link to="/dashboard" className="btn-icon" title="Volver al dashboard">
          <i className="fa-solid fa-right-to-bracket fa-lg"></i>
        </Link>
      </div>
        <div className="container my-4">
          
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h2 className="mb-0">Productos</h2>
            {canEdit && (
              <Link to="/menu/new" className="btn btn-primary">
                Nuevo producto
              </Link>
            )}
          </div>

          {/* Filtros */}
          <form className="row g-2 align-items-end mb-3" onSubmit={onSearch}>
            <div className="col-sm-4">
              <label className="form-label">Buscar</label>
              <input
                className="form-control"
                placeholder="Nombre..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="col-sm-3">
              <label className="form-label">Tipo</label>
              <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">Todos</option>
                <option value="DISH">Platillo</option>
                <option value="DRINK">Bebida</option>
              </select>
            </div>
            <div className="col-sm-3">
              <label className="form-label">Estado</label>
              <select className="form-select" value={active} onChange={(e) => setActive(e.target.value)}>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
                <option value="">Todos</option>
              </select>
            </div>
            <div className="col-sm-2 d-grid">
              <button className="btn btn-outline-primary" type="submit">Filtrar</button>
            </div>
          </form>

          {/* Errores */}
          {err && <div className="alert alert-danger">{err}</div>}

          {/* Tabla */}
          <div className="table-responsive app-elevated">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th className="text-end">Precio</th>
                  <th>Estado</th>
                  <th style={{width: 160}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6">
                      <div className="d-flex justify-content-center py-4">
                        <div className="spinner-border" role="status" aria-label="Cargando" />
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-3">Sin resultados</td>
                  </tr>
                ) : (
                  items.map((it) => (
                    <tr key={it.id} className={!it.active ? "table-secondary" : ""}>
                      <td>{it.name}</td>
                      <td>{it.type === "DISH" ? "Platillo" : "Bebida"}</td>
                      <td className="text-end">₡{Number(it.price).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${it.active ? "bg-success" : "bg-secondary"}`}>
                          {it.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link to={`/menu/${it.id}/edit`} className="btn btn-sm btn-outline-primary">
                            Editar
                          </Link>
                          {canEdit && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => onDelete(it.id, it.name)}
                              disabled={!it.active}
                              title={!it.active ? "Ya está inactivo" : "Inactivar"}
                            >
                              Inactivar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
      </div>
      <Footer />
    </div>
  );
}
