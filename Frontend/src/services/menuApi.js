import { api } from "../api";

export async function fetchMenu(params = {}) {
  const { type, active, q } = params;
  const res = await api.get("/menu", { params: { type, active, q } });
  return res.data;
}

export async function getMenuById(id) {
  const res = await api.get(`/menu/${id}`);
  return res.data;
}

export async function createMenu(payload) {
  const res = await api.post("/menu", payload);
  return res.data;
}

export async function updateMenu(id, payload) {
  const res = await api.put(`/menu/${id}`, payload);
  return res.data;
}

export async function softDeleteMenu(id) {
  const res = await api.delete(`/menu/${id}`); // active=false
  return res.data;
}
