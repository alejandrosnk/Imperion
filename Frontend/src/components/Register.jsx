import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";           
import { useAuth } from "../context/AuthContext";
import "../styles/forms.css";

export default function Register() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      // 1) Registrar
      await api.post("/auth/register", form);
      // 2) Loguear de una vez para persistir sesión
      await login(form.email, form.password);
      nav("/dashboard");
    } catch (ex) {
      setErr(ex?.response?.data?.message || ex.message || "Error al registrar");
    }
  };

  return (
    <main className="imp-login" role="main">
      <aside className="imp-right">
        <div className="imp-right-inner">
          <h2>Create your account</h2>
          <p>Join Imperion and start managing your restaurant today.</p>
        </div>
      </aside>

      <section className="imp-left">
        <div className="imp-brand">
          <div className="imp-logo-dot" aria-hidden="true" />
          <div>
            <h1 className="imp-title">Imperion</h1>
            <p className="imp-subtitle">We are The Lotus Team</p>
          </div>
        </div>

        <form className="imp-form" onSubmit={onSubmit} aria-describedby={err ? "regErr" : undefined} noValidate>
          <p className="imp-form-lead">Create a new account</p>

          <label className="imp-label" htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            className="imp-input"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
            placeholder="Jane Doe"
          />

          <label className="imp-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="imp-input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            placeholder="you@email.com"
            autoComplete="username"
          />

          <label className="imp-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="imp-input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            placeholder="••••••••"
            autoComplete="new-password"
          />

          {err && (
            <div id="regErr" className="imp-error" role="alert" aria-live="assertive">
              {err}
            </div>
          )}

          <button className="imp-btn" type="submit">Create account</button>

          <div className="imp-cta" style={{ marginTop: 12 }}>
            <span>Already have an account?</span>
            <Link to="/login" className="imp-ghost-btn">Log in</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
