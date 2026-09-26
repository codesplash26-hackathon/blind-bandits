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
  destinations: {
    list: "/destinations",
    detail: (identifier: number | string) => `/destinations/${identifier}`,
    sustainability: (destinationId: number) =>
      `/destinations/${destinationId}/sustainability`,
    pressure: (destinationId: number) => `/destinations/${destinationId}/pressure`,
    pressureExplanation: (destinationId: number) =>
      `/destinations/${destinationId}/pressure/explanation`,
    alternatives: (destinationId: number) =>
      `/destinations/${destinationId}/alternatives`,
    simulate: (destinationId: number) =>
      `/destinations/${destinationId}/simulate`,
  },
  map: {
    destinations: "/map/destinations",
  },
  recommendations: {
    create: "/recommendations",
    history: "/recommendations/history",
  },
  saved: {
    list: "/saved",
    create: (destinationId: number) => `/saved/${destinationId}`,
    remove: (destinationId: number) => `/saved/${destinationId}`,
  },
  interactions: {
    create: "/interactions",
  },
  adminDestinations: {
    create: "/admin/destinations",
    update: (destinationId: number) => `/admin/destinations/${destinationId}`,
    deactivate: (destinationId: number) => `/admin/destinations/${destinationId}`,
  },
  adminDashboard: {
    summary: "/admin/dashboard",
  },
  adminAnalytics: {
    summary: "/admin/analytics",
  },
};

export default apiPaths;
export { apiPaths };
