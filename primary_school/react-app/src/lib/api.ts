export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    roleLabel: string;
    dashboardPath: string;
    availableDashboards: string[];
  };
}

const request = async <T>(
  input: string,
  init?: RequestInit,
): Promise<T> => {
  const response = await fetch(input, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data as T;
};

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
