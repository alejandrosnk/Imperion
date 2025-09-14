import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const isWaiter = user?.role === "WAITER";

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="container my-4 flex-grow-1">
        <h1 className="mb-3">Bienvenido al Dashboard</h1>
        <p className="text-muted">
          Accesos rápidos a secciónes importantes.
        </p>

        <div className="row g-3 mt-2">
          {/* Ver Productos (todos los roles) */}
          <div className="col-sm-6 col-lg-4">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title mb-2">Productos</h5>
                <p className="card-text text-muted flex-grow-1">
                  Consulta y filtra platillos y bebidas del menú.
                </p>
                <Link to="/menu" className="btn btn-outline-primary mt-auto">
                  Ver productos
                </Link>
              </div>
            </div>
          </div>

          {/* Crear Producto (solo ADMIN) */}
          {isAdmin && (
            <div className="col-sm-6 col-lg-4">
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title mb-2">Nuevo producto</h5>
                  <p className="card-text text-muted flex-grow-1">
                    Crea platillos o bebidas y defínelos como activos.
                  </p>
                  <Link to="/menu/new" className="btn btn-primary mt-auto">
                    Crear producto
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Ver Pedidos solo admin */}
          {isAdmin && (
          <div className="col-sm-6 col-lg-4">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title mb-2">Pedidos</h5>
                <p className="card-text text-muted flex-grow-1">
                  Consulta los pedidos registrados y su estado.
                </p>
                <Link to="/orders" className="btn btn-outline-success mt-auto">
                  Ver pedidos
                </Link>
              </div>
            </div>
          </div>
          )}

          {/* Historial de pagos (solo ADMIN) */}
          {isAdmin && (
            <div className="col-sm-6 col-lg-4">
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title mb-2">Historial de pagos</h5>
                  <p className="card-text text-muted flex-grow-1">
                    Revisa los pagos registrados por pedidos.
                  </p>
                  <Link to="/payments" className="btn btn-outline-info mt-auto">
                    Ver pagos
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Mesas (solo MESERO) */}
          {isWaiter && (
            <div className="col-sm-6 col-lg-4">
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title mb-2">Mesas</h5>
                  <p className="card-text text-muted flex-grow-1">
                    Selecciona una mesa disponible para crear un pedido.
                  </p>
                  <Link to="/tables" className="btn btn-outline-warning mt-auto">
                    Ver mesas
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Dashboard;
