import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

function PaymentPage() {
  const { id } = useParams(); // orderId
  const { token } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [payments, setPayments] = useState([]);
  const [method, setMethod] = useState("CASH");
  const [selectedItems, setSelectedItems] = useState([]);
  const [paidItems, setPaidItems] = useState([]); // ítems ya pagados

  const fetchOrder = async () => {
    const res = await api.get(`/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setOrder(res.data);
  };

  const fetchPayments = async () => {
    const res = await api.get(`/payments?orderId=${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setPayments(res.data.rows);
  };

  useEffect(() => {
    fetchOrder();
    fetchPayments();
  }, [id, token]);

  const toggleItem = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((i) => i !== itemId) : [...prev, itemId]
    );
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert("Selecciona al menos un producto para pagar");
      return;
    }

    // calcular el monto a pagar según productos seleccionados
    const itemsToPay = order.items.filter((i) => selectedItems.includes(i.id));
    const amount = itemsToPay.reduce((s, i) => s + i.qty * i.unit_price, 0);

    try {
      await api.post(
        "/payments",
        { order_id: id, amount, method, items: selectedItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPaidItems((prev) => [...prev, ...selectedItems]);
      setSelectedItems([]);

      // refrescar datos
      await fetchOrder();
      await fetchPayments();

      // calcular total pagado y pendiente
      const total = order.items.reduce((s, i) => s + i.qty * i.unit_price, 0);
      const pagado = payments.reduce((s, p) => s + parseFloat(p.amount), 0) + amount;

      if (pagado >= total) {
        alert("Pedido pagado completamente ✅");
        navigate("/tables"); // redirigir al dashboard de mesas
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error procesando pago");
    }
  };

  if (!order) return <p>Cargando pedido...</p>;

  const total = order.items.reduce((s, i) => s + i.qty * i.unit_price, 0);
  const pagado = payments.reduce((s, p) => s + parseFloat(p.amount), 0);
  const pendiente = total - pagado;

  return (
    <div className="container my-4">
      <Link to={`/orders/${id}`} className="btn btn-secondary mb-3">
        ← Volver al pedido
      </Link>
      <h2>Pago Pedido #{order.id}</h2>
      <p><strong>Total:</strong> ₡{total.toFixed(2)}</p>
      <p><strong>Pagado:</strong> ₡{pagado.toFixed(2)}</p>
      <p><strong>Pendiente:</strong> ₡{pendiente.toFixed(2)}</p>

      <h4>Seleccionar productos para pagar</h4>
      <form onSubmit={handlePay}>
        <ul className="list-group mb-3">
          {order.items
            .filter(i => !paidItems.includes(i.id))
            .map((i) => {
              const totalItem = i.qty * i.unit_price;
              return (
                <li key={i.id} className="list-group-item d-flex align-items-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(i.id)}
                    onChange={() => toggleItem(i.id)}
                    className="form-check-input me-2"
                  />
                  {i.menu_name} x {i.qty} = ₡{totalItem.toFixed(2)}
                </li>
              );
            })}
        </ul>

        <div className="row g-2">
          <div className="col-md-4">
            <select
              className="form-select"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="CASH">Efectivo</option>
              <option value="CARD">Tarjeta</option>
              <option value="SINPE">SINPE</option>
            </select>
          </div>
          <div className="col-md-4">
            <button className="btn btn-primary w-100">Pagar seleccionados</button>
          </div>
        </div>
      </form>

      <h4 className="mt-4">Pagos realizados</h4>
      <ul>
        {payments.map((p) => (
          <li key={p.id}>
            {p.method} - ₡{p.amount} ({new Date(p.created_at).toLocaleString()})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PaymentPage;
