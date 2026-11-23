export const API_BASE = import.meta.env.VITE_API_BASE_URL;
export const getToken = () => {
  return localStorage.getItem("token");
};
