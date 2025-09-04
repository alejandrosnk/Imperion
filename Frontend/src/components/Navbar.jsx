import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/navbar.css";

function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom sticky-top px-3">
      <div className="container-fluid">
        <span className="navbar-brand">Imperion</span>
        <button onClick={handleLogout} className="btn btn-logout">
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
