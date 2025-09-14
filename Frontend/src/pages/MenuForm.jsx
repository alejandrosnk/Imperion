import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/buttons.css"; 
import { createMenu, getMenuById, updateMenu } from "../services/menuApi";

const TYPES = [
  { value: "DISH", label: "Platillo" },
  { value: "DRINK", label: "Bebida" },
];

export default function MenuForm() {
  const { id } = useParams(); // si existe → editar
  const isEdit = Boolean(id);
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    type: "DISH",
    price: "",
    active: true,
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!isEdit) return;
      try {
        setLoading(true);
        const data = await getMenuById(id);
        setForm({
          name: data.name,
          type: data.type,
          price: String(data.price),
          active: Boolean(data.active),
        });
      } catch (e) {
        setErr(e?.response?.data?.message || e.message || "No se pudo cargar");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    // Validaciones simples
    if (!form.name.trim()) return setErr("El nombre es obligatorio");
    const price = Number(form.price);
    if (Number.isNaN(price) || price < 0) return setErr("Precio inválido");

    try {
      setLoading(true);
      const payload = {
        name: form.name.trim(),
        type: form.type,
        price,
        active: Boolean(form.active),
      };

      if (isEdit) await updateMenu(id, payload);
      else await createMenu(payload);

      nav("/menu");
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "No se pudo guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="container my-3">
        <Link to="/menu" className="btn-icon" title="Volver a productos">
          <i className="fa-solid fa-right-to-bracket fa-lg"></i>
        </Link>
      </div>
      {/* Contenido principal (ocupa espacio disponible) */}
      <main className="container my-4 flex-grow-1">
        <h2 className="mb-3">{isEdit ? "Editar producto" : "Nuevo producto"}</h2>

        {err && <div className="alert alert-danger">{err}</div>}

        <form className="row g-3" onSubmit={onSubmit} noValidate>
          <div className="col-md-6">
            <label className="form-label">Nombre</label>
            <input
              className="form-control"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              maxLength={120}
              placeholder="Ej. Casado con pollo"
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Tipo</label>
            <select
              className="form-select"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Precio</label>
            <div className="input-group">
              <span className="input-group-text">₡</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="col-12">
            <div className="form-check">
              <input
                id="active"
                className="form-check-input"
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              <label className="form-check-label" htmlFor="active">
                Activo
              </label>
            </div>
          </div>

          <div className="col-12 d-flex gap-2">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {isEdit ? "Guardar cambios" : "Crear producto"}
            </button>
            <button className="btn btn-outline-secondary" type="button" onClick={() => nav("/menu")}>
              Cancelar
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
