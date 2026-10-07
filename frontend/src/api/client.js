const API_URL = import.meta.env.VITE_API_URL || "/api";

export async function apiGet(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Error ${res.status}`);
  }
  return res.json();
}

export function getHealth() {
  return apiGet("/health");
}

export function getProductos() {
  return apiGet("/productos");
}
