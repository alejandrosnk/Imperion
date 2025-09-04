import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeSwitch from "./ThemeSwitch";
import '../styles/forms.css'

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await login(form.email, form.password);
      nav("/dashboard");
    } catch (ex) {
      setErr(ex.message || "Error al iniciar sesión");
    }
  };

  return (
    <>
      <main className="imp-login" id="mainContent" role="main">
        {/* Panel derecho con gradiente mint→cream */}
        <aside className="imp-right" aria-label="Company information">
          <div className="imp-right-inner">
            <h2>We are more than just a company</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        </aside>

        {/* Panel izquierdo con formulario */}
        <section className="imp-left" aria-labelledby="brandTitle">
          <div className="imp-brand">
            <div className="imp-logo-dot" aria-hidden="true" />
            <div>
              <h1 id="brandTitle" className="imp-title">Imperion</h1>
              <p className="imp-subtitle">We are The Lotus Team</p>
            </div>
            <ThemeSwitch />
          </div>

          <form
            className="imp-form"
            onSubmit={onSubmit}
            aria-describedby={err ? "impError" : undefined}
            noValidate
          >
            <p className="imp-form-lead">Please login to your account</p>

            {/* Username */}
            <label className="imp-label" htmlFor="email">Username</label>
            <input
              id="email"
              type="email"
              className="imp-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="username"
              placeholder="your@email.com"
              aria-invalid={Boolean(err)}
              inputMode="email"
            />

            {/* Password */}
            <label className="imp-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="imp-input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={Boolean(err)}
            />

            {err && (
              <div
                id="impError"
                className="imp-error"
                role="alert"
                aria-live="assertive"
              >
                {err}
              </div>
            )}

            <button className="imp-btn" type="submit">Log in</button>

            <button
              className="imp-link-btn"
              type="button"
              onClick={() => window.alert("Recover flow pending")}
            >
              Forgot password?
            </button>
          </form>

          <div className="imp-cta">
            <span>Don't have an account?</span>
            <Link to="/register" className="imp-ghost-btn">
              Create new
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
              