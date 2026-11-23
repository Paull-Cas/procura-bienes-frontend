import { API_BASE } from "../../api_base";
import { getToken } from "../../api_base";

export const fetchModulos = async () => {
  const response = await fetch(`${API_BASE}/modulos/permitidos`, {
    method: "GET",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await response.json();
  return data?.object || [];
};

export const authenticateUser = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE}/auth/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (response.status === 401) {
    throw new Error("Credenciales inválidas");
  }

  const token = await response.text();
  return token;
};

export const fetchUserProfile = async () => {
  try {
    const response = await fetch(`${API_BASE}/usuario/dashboard`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return data?.object || null;
  } catch (error) {
    throw error;
  }
};

