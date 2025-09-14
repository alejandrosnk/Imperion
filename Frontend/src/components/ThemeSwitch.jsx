import { useTheme } from "../context/ThemeContext";

function ThemeSwitch() {
  const ctx = useTheme();
  if (!ctx) return null;

  const { theme, toggleTheme } = ctx;

  return (
    <button
      className="btn btn-sm d-flex align-items-center justify-content-center"
      onClick={toggleTheme}
      style={{ border: "none", background: "transparent", fontSize: "1.5rem" }}
      aria-label="Cambiar tema"
    >
      {theme === "dark" ? (
        <i className="fas fa-sun text-warning"></i>
      ) : (
        <i className="fas fa-moon text-light"></i>
      )}

    </button>
  );
}

export default ThemeSwitch;
