 import { api } from "../api.js";

// Listar pagos
export async function getPayments() {
  const res = await api.get("/payments");
  return res.data;
}
