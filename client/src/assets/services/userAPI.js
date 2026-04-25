import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api" });

// Add interceptor to attach JWT token to headers if user is logged in
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Add interceptor to automatically log out if token is invalid or expired
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const getDashboardStats = () => API.get("/user/dashboard");
export const getAnalyticsData = () => API.get("/user/analytics");
export const submitQuizResult = (data) => API.post("/quiz/submit", data);
