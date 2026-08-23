const API_BASE = '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload.data;
}

export const api = {
  get(path) {
    return request(path);
  },
  post(path, body) {
    return request(path, { method: 'POST', body: JSON.stringify(body) });
  },
  put(path, body) {
    return request(path, { method: 'PUT', body: JSON.stringify(body) });
  },
  delete(path) {
    return request(path, { method: 'DELETE' });
  },
};
