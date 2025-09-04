import { useTheme } from "../context/ThemeContext";

function ThemeSwitch() {
  const ctx = useTheme();

  // Si por alguna razón no hay provider, evita crashear el árbol
  if (!ctx) return null;

  const { theme, toggleTheme } = ctx;

  return (
    <div className="form-check form-switch">
      <input
        className="form-check-input"
        type="checkbox"
        id="themeSwitch"
        checked={theme === "dark"}
        onChange={toggleTheme}
      />
      <label className="form-check-label ms-2" htmlFor="themeSwitch">
        {theme === "dark" ? "Oscuro 🌙" : "Claro ☀️"}
      </label>
    </div>
  );
}

export default ThemeSwitch;
