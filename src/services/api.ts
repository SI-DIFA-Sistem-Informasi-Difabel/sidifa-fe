// CSRF PROTECTION FLOW
// ---------------------
// - Semua request POST/PUT/PATCH/DELETE akan otomatis fetch CSRF token dari /csrf/token jika belum ada.
// - Token hanya di-fetch sekali per session (reload). Jika ingin fetch ulang, reset flag csrfFetched.
// - Saat logout, flag csrfFetched direset agar token di-fetch ulang saat login berikutnya.
//
// Pastikan backend mengirimkan cookie _csrf dan frontend sudah mengatur xsrfCookieName & xsrfHeaderName sesuai backend.

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PUBLIC_API_URL || "http://localhost:3000/api/v1",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  xsrfCookieName: "_csrf",
  xsrfHeaderName: "X-CSRF-TOKEN",
  timeout: 10000, // 10 detik timeout
});

// CSRF Token fetcher
/**
 * Fetch CSRF token dari backend agar cookie _csrf tersedia di browser.
 * Wajib dipanggil sebelum request POST/PUT/DELETE yang butuh CSRF protection.
 */
export async function fetchCsrfToken() {
  const response = await axios.get(
    `${import.meta.env.PUBLIC_API_URL || "http://localhost:3000/api/v1"}/csrf/token`,
    {
      withCredentials: true,
    },
  );
  return response.data;
}

// Auto-fetch CSRF token untuk semua request POST/PUT/PATCH/DELETE
let csrfFetched = false;
let csrfTokenValue: string | null = null;

api.interceptors.request.use(async (config) => {
  if (
    ["post", "put", "patch", "delete"].includes(
      config.method?.toLowerCase() || "",
    ) &&
    !csrfFetched
  ) {
    try {
      const response = await fetchCsrfToken();
      csrfTokenValue = response.csrfToken;
      csrfFetched = true;
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error);
    }
  }

  // Set CSRF header jika token sudah ada
  if (
    csrfTokenValue &&
    ["post", "put", "patch", "delete"].includes(
      config.method?.toLowerCase() || "",
    )
  ) {
    config.headers["X-CSRF-TOKEN"] = csrfTokenValue;
  }

  return config;
});

// Request interceptor untuk JWT dan logging
api.interceptors.request.use((config) => {
  console.log("🚀 REQUEST:", {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    fullURL: `${config.baseURL}${config.url}`,
    data: config.data,
    headers: config.headers,
  });

  // Debug CSRF token
  if (
    ["post", "put", "patch", "delete"].includes(
      config.method?.toLowerCase() || "",
    )
  ) {
    console.log("🔍 CSRF Debug:", {
      cookieName: "_csrf",
      headerName: "X-CSRF-TOKEN",
      headerValue: config.headers?.["X-CSRF-TOKEN"],
      allHeaders: config.headers,
    });
  }

  return config;
});

// Response interceptor untuk logging dan token refresh
api.interceptors.response.use(
  (response) => {
    console.log("✅ RESPONSE:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    console.log("❌ ERROR:", {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(new Error(error.response?.data?.message));
  },
);

// Profile service functions
export const profileService = {
  async getProfile() {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

// Auth service functions
export const authService = {
  /**
   * Melakukan logout user dan reset state CSRF agar token di-fetch ulang saat login berikutnya
   */
  async logout() {
    csrfFetched = false;
    csrfTokenValue = null;
    const response = await api.post("/auth/logout");
    return response.data;
  },
  /**
   * Melakukan refresh token
   */
  async refresh() {
    const response = await api.post("/auth/refresh");
    return response.data;
  },
  /**
   * Melakukan login user. Tidak perlu manual fetch CSRF, sudah otomatis di interceptor.
   * @param {object} data - Data login (username, password, dst)
   */
  async login(data: any) {
    const response = await api.post("/auth/login", data);
    return response.data;
  },
};

export default api;
