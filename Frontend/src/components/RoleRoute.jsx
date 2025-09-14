import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ roles = [], children }) {
  const { user, authReady } = useAuth();

  if (!authReady) return null; // espera rehidratación
  if (!user) return <Navigate to="/login" replace />;

  if (roles.length > 0 && !roles.includes(user.role)) {
    // si no tiene el rol, se envia al dashboard
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
