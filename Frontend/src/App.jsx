import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import RoleRoute from "./components/RoleRoute";
import TableDetail from "./pages/TableDetail"
import OrdersList from "./pages/OrdersList";
import OrderDetail from "./pages/OrderDetail";
import OrderPage from "./pages/OrderPage";
import MenuList from "./pages/MenuList";
import MenuForm from "./pages/MenuForm";
import PaymentsList from "./pages/PaymentsList";
import TablesPage from "./pages/TablesPage"; 
import PaymentPage from "./pages/PaymentPage";

import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard (todos los roles) */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* === MESAS === */}
          <Route
            path="/tables"
            element={
              <PrivateRoute>
                <RoleRoute roles={["WAITER", "ADMIN"]}>
                  <TablesPage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* Crear pedido desde mesa */}
          <Route
            path="/tables/:id/order"
            element={
              <PrivateRoute>
                <RoleRoute roles={["WAITER", "ADMIN"]}>
                  <OrderPage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/tables/:id"
            element={
              <PrivateRoute>
                <TableDetail />
              </PrivateRoute>
            }
          />

          {/* === MENÚ === */}
          <Route
            path="/menu"
            element={
              <PrivateRoute>
                <MenuList />
              </PrivateRoute>
            }
          />
          <Route
            path="/menu/new"
            element={
              <PrivateRoute>
                <RoleRoute roles={["ADMIN"]}>
                  <MenuForm />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/menu/:id/edit"
            element={
              <PrivateRoute>
                <RoleRoute roles={["ADMIN"]}>
                  <MenuForm />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* === PEDIDOS === */}
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <OrdersList />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <PrivateRoute>
                <OrderDetail />
              </PrivateRoute>
            }
          />

          {/* === PAGOS (solo ADMIN) === */}
          <Route
            path="/payments"
            element={
              <PrivateRoute>
                <RoleRoute roles={["ADMIN"]}>
                  <PaymentsList />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/orders/:id/pay"
            element={
              <PrivateRoute>
                <PaymentPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
