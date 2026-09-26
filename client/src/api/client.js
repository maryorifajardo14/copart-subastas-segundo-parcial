const BASE_URL = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('copart_token');
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : null;

  if (!res.ok) {
    throw new Error(data?.error || `Error ${res.status}`);
  }
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: () => request('/auth/me', { auth: true }),

  listarSubastas: (filtros = {}) => {
    const params = new URLSearchParams(Object.entries(filtros).filter(([, v]) => v));
    const qs = params.toString();
    return request(`/auctions${qs ? `?${qs}` : ''}`, { auth: true });
  },
  obtenerSubasta: (id) => request(`/auctions/${id}`, { auth: true }),
  ofertar: (id, monto) => request(`/auctions/${id}/bids`, { method: 'POST', body: { monto }, auth: true }),

  publicarVehiculo: (payload) => request('/vehicles', { method: 'POST', body: payload, auth: true }),
  misPublicaciones: (q) => request(`/vehicles/mine${q ? `?q=${encodeURIComponent(q)}` : ''}`, { auth: true }),
  obtenerVehiculo: (id) => request(`/vehicles/${id}`, { auth: true }),
  actualizarVehiculo: (id, payload) => request(`/vehicles/${id}`, { method: 'PUT', body: payload, auth: true }),
  eliminarVehiculo: (id) => request(`/vehicles/${id}`, { method: 'DELETE', auth: true }),
};

export { getToken };
