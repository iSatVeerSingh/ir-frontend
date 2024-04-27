import axios from "axios";

class InspectionApi {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(url, method = "GET", data = null, headers = {}, signal) {
    try {
      if (!navigator.onLine) {
        return {
          data: null,
          error: "No Internet Connection",
        };
      }

      const endpoint = this.baseUrl + url;

      let auth = "";
      const jsonUser = localStorage.getItem("user");
      if (jsonUser) {
        const user = JSON.parse(jsonUser);
        auth = `Bearer ${user.access_token}`;
      }

      const config = {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: auth,
          ...headers,
        },
        signal: signal,
      };

      if (data) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(endpoint, config);
      const responseData = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          if (navigator.serviceWorker !== undefined) {
            const sw = await navigator.serviceWorker.getRegistration();
            if (sw) {
              await sw.unregister();
            }
          }
          location.pathname = "/login"
        }

        return {
          data: null,
          error: responseData?.message || "Request failed",
        };
      }

      return {
        data: responseData,
        error: null,
      };
    } catch (err) {
      if (err?.name === "AbortError") {
        return {
          data: null,
          error: "AbortError",
        };
      }

      return {
        data: null,
        error: `HTTP Error: ${err?.message}`,
      };
    }
  }

  get(url, headers = {}, signal) {
    return this.request(url, "GET", null, headers, signal);
  }

  post(url, data, headers = {}, signal) {
    return this.request(url, "POST", data, headers, signal);
  }

  put(url, data, headers = {}, signal) {
    return this.request(url, "PUT", data, headers, signal);
  }

  delete(url, headers = {}, signal) {
    return this.request(url, "DELETE", null, headers, signal);
  }
}

export default new InspectionApi("/api");

export const inspectionApiAxios = axios.create({
  baseURL: "/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

inspectionApiAxios.interceptors.request.use((config) => {
  const jsonUser = localStorage.getItem("user");
  if (jsonUser) {
    const user = JSON.parse(jsonUser);
    config.headers.Authorization = `Bearer ${user.access_token}`;
  }
  return config;
});

inspectionApiAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!navigator.onLine) {
      return {
        data: {
          message:
            error.response.data.message ||
            "No Internet Connection. You are offline",
        },
      };
    }

    if (error.code === "ERR_NETWORK") {
      return {
        data: {
          message:
            error.response.data.message ||
            "No Internet Connection. You are offline",
        },
      };
    }

    if (error.response?.status === 401) {
      redirect("/login");
      return;
    }

    return {
      data: {
        message: error.response.data.message,
      },
    };
  }
);
