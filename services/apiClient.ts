import axios from "axios";

/**
 * Centralised HTTP client for the Crypto Briefs publishing API.
 *
 * The backend protects `api/upload` and `api/blog` with a `requireAdmin`
 * middleware, so every request must carry an admin credential. This is the
 * single place that attaches it.
 *
 * SECURITY NOTE: this is a client-only SPA, so `APP_ADMIN_TOKEN` is baked into
 * the public JS bundle and is readable by anyone who loads the app (same
 * caveat as every other "env var" here — see CLAUDE.md). It stops anonymous /
 * bot calls, not a determined user. Real protection needs a server-side proxy.
 *
 * If your `requireAdmin` middleware validates a different header or scheme
 * (e.g. `x-api-key: <token>` instead of `Authorization: Bearer <token>`),
 * change ONLY the interceptor below.
 */
const ADMIN_TOKEN = process.env.APP_ADMIN_TOKEN;

const apiClient = axios.create();

apiClient.interceptors.request.use((config) => {
  if (ADMIN_TOKEN) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${ADMIN_TOKEN}`;
  }
  return config;
});

export default apiClient;
