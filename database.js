'use strict';

/*
 * DIP database communication layer.
 * Browser JavaScript communicates with the database through FastAPI.
 * Never put database credentials in frontend JavaScript.
 */
window.DIPDatabase = (() => {
  const API = '/api/auth';

  async function request(path, options = {}) {
    const response = await fetch(API + path, {
      method: options.method || 'GET',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {})
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {})
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.detail || 'Request failed. Please try again.');
      error.status = response.status;
      throw error;
    }
    return data;
  }

  return Object.freeze({
    signup: ({ name, email, password }) =>
      request('/signup', { method: 'POST', body: { name, email, password } }),

    login: ({ email, password }) =>
      request('/login', { method: 'POST', body: { email, password } }),

    currentUser: () => request('/me'),

    logout: () => request('/logout', { method: 'POST' })
  });
})();
