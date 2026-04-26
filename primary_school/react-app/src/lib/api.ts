export interface LoginResponse {
  token: string;
  user: any;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const request = async <T>(
  input: string,
  init?: RequestInit,
): Promise<T> => {
  const target = input.startsWith("http") ? input : `${API_BASE_URL}${input}`;
  
  // Get token from localStorage
  const saved = localStorage.getItem("user");
  let token = "";
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      token = parsed.token || "";
    } catch (e) {}
  }

  const response = await fetch(target, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    ...init,
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 && !input.includes("/login")) {
      // Optional: Handle token expiration/unauthorized
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    throw new Error(data.message || "Request failed.");
  }

  return data as T;
};

export const api = {
  get: <T>(path: string, params?: Record<string, any>) => {
    let url = path;
    if (params) {
      const query = Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&");
      if (query) url += (url.includes("?") ? "&" : "?") + query;
    }
    return request<T>(url);
  },
  post: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: <T>(path: string) =>
    request<T>(path, {
      method: "DELETE",
    }),
};
