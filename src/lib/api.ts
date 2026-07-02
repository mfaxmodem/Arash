// API client with CSRF token handling for mutations

let csrfToken: string | null = null;

async function ensureCsrf() {
  if (!csrfToken) {
    try {
      const res = await fetch("/api/csrf");
      const data = await res.json();
      csrfToken = data.token;
    } catch {
      csrfToken = null;
    }
  }
  return csrfToken;
}

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const isMutation = method !== "GET" && method !== "HEAD";

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // For mutations, include CSRF token header (double-submit pattern)
  if (isMutation) {
    const token = await ensureCsrf();
    if (token) headers["x-csrf-token"] = token;
    if (options.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
  }

  const res = await fetch(url, { ...options, headers, credentials: "same-origin" });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = (data as any)?.error || `خطای سرور (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

export const api = {
  get: <T>(url: string) => apiFetch<T>(url),
  post: <T>(url: string, body?: unknown) =>
    apiFetch<T>(url, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(url: string, body?: unknown) =>
    apiFetch<T>(url, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  del: <T>(url: string) => apiFetch<T>(url, { method: "DELETE" }),
};
