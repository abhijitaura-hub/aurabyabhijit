import axios from "axios";

export const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const fetchArticles = (params = {}) =>
  axios.get(`${API}/articles`, { params }).then((r) => r.data);

export const fetchArticle = (slug) =>
  axios.get(`${API}/articles/${slug}`).then((r) => r.data);

export const submitContact = (payload) =>
  axios.post(`${API}/contact`, payload).then((r) => r.data);

export const adminLogin = (email, password) =>
  axios.post(`${API}/admin/login`, { email, password }).then((r) => r.data);

export const fetchMessages = (token) =>
  axios.get(`${API}/admin/messages`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.data);

export function formatApiError(err, fallback = "Something went wrong. Please try again.") {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((e) => e?.msg || "").filter(Boolean).join(" ");
  return fallback;
}
