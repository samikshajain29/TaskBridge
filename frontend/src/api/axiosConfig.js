import axios from 'axios';

const api = axios.create({
  baseURL: "https://taskbridgeserver.onrender.com/api",
  withCredentials: true, // Necessary to send/receive httpOnly cookies for refresh token
});

// Interceptor to attach access token if it exists in local storage (we'll sync this from AuthContext)
api.interceptors.request.use(
  (config) => {
    const userState = JSON.parse(localStorage.getItem('auth') || '{}');
    if (userState && userState.accessToken) {
      config.headers['Authorization'] = `Bearer ${userState.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle 401 Unauthorized errors and refresh tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already retried this exact request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to get a new access token via refresh endpoint
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (res.status === 200) {
          const { accessToken } = res.data;

          // Update access token in local storage
          const userState = JSON.parse(localStorage.getItem('auth') || '{}');
          userState.accessToken = accessToken;
          localStorage.setItem('auth', JSON.stringify(userState));

          // Set the new token in the original request and retry
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails (e.g. refresh token expired), clear state and redirect to login
        localStorage.removeItem('auth');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
