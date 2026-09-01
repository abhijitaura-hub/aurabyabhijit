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

const authed = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const fetchAdminArticles = (token) =>
  axios.get(`${API}/admin/articles`, authed(token)).then((r) => r.data);

export const createArticle = (token, payload) =>
  axios.post(`${API}/admin/articles`, payload, authed(token)).then((r) => r.data);

export const updateArticle = (token, id, payload) =>
  axios.put(`${API}/admin/articles/${id}`, payload, authed(token)).then((r) => r.data);

export const deleteArticle = (token, id) =>
  axios.delete(`${API}/admin/articles/${id}`, authed(token)).then((r) => r.data);

export const uploadArticleImage = (token, file) => {
  const form = new FormData();
  form.append("file", file);
  return axios.post(`${API}/admin/upload`, form, authed(token)).then((r) => r.data);
};

export const mediaUrl = (path) => `${API}/media/${path}`;

export const subscribeNewsletter = (payload) =>
  axios.post(`${API}/newsletter/subscribe`, payload).then((r) => r.data);

export const fetchSubscribers = (token) =>
  axios.get(`${API}/admin/subscribers`, authed(token)).then((r) => r.data);

export const trackPageview = (path) =>
  axios.post(`${API}/analytics/track`, { path, referrer: document.referrer || undefined }).catch(() => {});

export const fetchAnalytics = (token, days = 30) =>
  axios.get(`${API}/admin/analytics`, { ...authed(token), params: { days } }).then((r) => r.data);

export const fetchSettings = () =>
  axios.get(`${API}/settings`).then((r) => r.data);

export const updateSettings = (token, payload) =>
  axios.put(`${API}/admin/settings`, payload, authed(token)).then((r) => r.data);

export const trackEvent = (path, event, target) =>
  axios.post(`${API}/analytics/track`, { path, event, target, referrer: document.referrer || undefined }).catch(() => {});

export const fetchRecoCategories = () =>
  axios.get(`${API}/recommendations/categories`).then((r) => r.data);

export const fetchRecommendations = (params = {}) =>
  axios.get(`${API}/recommendations`, { params }).then((r) => r.data);

export const fetchRecommendation = (slug) =>
  axios.get(`${API}/recommendations/${slug}`).then((r) => r.data);

export const fetchAdminRecommendations = (token) =>
  axios.get(`${API}/admin/recommendations`, authed(token)).then((r) => r.data);

export const createRecommendation = (token, payload) =>
  axios.post(`${API}/admin/recommendations`, payload, authed(token)).then((r) => r.data);

export const updateRecommendation = (token, id, payload) =>
  axios.put(`${API}/admin/recommendations/${id}`, payload, authed(token)).then((r) => r.data);

export const deleteRecommendation = (token, id) =>
  axios.delete(`${API}/admin/recommendations/${id}`, authed(token)).then((r) => r.data);

export const createRecoCategory = (token, payload) =>
  axios.post(`${API}/admin/recommendation-categories`, payload, authed(token)).then((r) => r.data);

export function formatApiError(err, fallback = "Something went wrong. Please try again.") {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((e) => e?.msg || "").filter(Boolean).join(" ");
  return fallback;
}
