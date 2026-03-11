/**
 * api.js — Couche d'abstraction fetch pour l'API JMB Task Manager
 * ES6+ module, pas de dépendances externes.
 */

const BASE_URL = '/api';

/**
 * Fetch wrapper avec headers JWT automatiques.(JSDoc au cas ou je reviens dessus)
 * @param {string} path
 * @param {RequestInit} [opts]
 * @returns {Promise<{ok: boolean, status: number, data: any}>}
 */

const request = async (path, opts = {}) => {
  // plus de getToken() ni de header Authorization
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include', // envoie du cookie
    headers: {
      'Content-Type': 'application/json',
      ...opts.headers, //spread des opts header (j'en ai pas en tête honnêtement)
    },
    ...opts,//spread des opts (ex METHOD : POST)
  });

  const data = await res.json().catch(() => null);

  //  CORRECTION : Sécurisation de la redirection
  if (res.status === 401) {
    const PUBLIC_PATHS = ['/', '/register'];
    if (!PUBLIC_PATHS.includes(window.location.pathname)) {
      window.location.href = '/';
    }
    return { ok: false, status: 401, data };
  }

  // On ne redirige que si on n'est pas déjà sur la page de login ('/')
  if (window.location.pathname !== '/') {
    window.location.href = '/';
  }

  return { ok: false, status: 401, data };
}
return { ok: res.ok, status: res.status, data };
};

// Auth (centralisation des appelle api pour les routes auth)

export const authAPI = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
};

// Tasks

export const tasksAPI = {
  //Méthode de filtrage des tasks
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined)) //supression des filtres des objets vide ou undefined
    ).toString();
    return request(`/tasks${qs ? `?${qs}` : ''}`);
  },

  //appelles api pour les routes tasks
  getOne: (id) => request(`/tasks/${id}`),
  create: (body) => request('/tasks', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  toggle: (id) => request(`/tasks/${id}/toggle`, { method: 'PATCH' }),
  delete: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
};