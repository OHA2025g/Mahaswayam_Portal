/** Backend origin for browser calls. Trailing slashes avoided so paths join as /api not //api */
const raw = process.env.REACT_APP_BACKEND_URL || '';
export const API_BASE = raw.replace(/\/+$/, '');
export const API = API_BASE ? `${API_BASE}/api` : '/api';
