/**
 * Every backend endpoint the app calls, in one place.
 *
 * Paths are relative to `NEXT_PUBLIC_API_URL`, which points at the backend's
 * API root (`http://localhost:8000/api/v1`). The version therefore lives in
 * the base URL — on the backend in `server.servlet.context-path`, here in the
 * env var — and never in the entries below.
 */
const apiPaths = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
  },
};

export default apiPaths;
export { apiPaths };
