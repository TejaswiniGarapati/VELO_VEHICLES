/**
 * API service - Axios not required; using fetch with base URL
 * For simplicity we use fetch. You can replace with axios if needed.
 */
const BASE = process.env.REACT_APP_API_URL || '';

async function request(url, options = {}) {
  const token = localStorage.getItem('velo_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const res = await fetch(BASE + url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data.message ||
      (Array.isArray(data.errors) && data.errors[0]?.msg) ||
      `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.errors = data.errors;
    err.data = data;
    throw err;
  }
  return data;
}

const api = {
  get: (url) => request(url, { method: 'GET' }),
  post: (url, body) => request(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url, body) => request(url, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (url, body) => request(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (url) => request(url, { method: 'DELETE' }),
  defaults: { headers: { common: {} } },
};

export default api;
