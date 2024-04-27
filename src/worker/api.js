import { DB } from "./db";

class ServerApi {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(url, method = "GET", data = null, headers = {}) {
    try {
      const endpoint = this.baseURL + url;

      const user = await DB.users.get("user");
      if (!user) {
        return {
          success: false,
          data: null,
          error: "Please login again",
        };
      }

      const config = {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.access_token}`,
          ...headers,
        },
      };

      if (data) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(endpoint, config);
      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          location.pathname = "/login";
        }

        return {
          data: null,
          error: responseData.message || "Request failed",
        };
      }

      return { data: responseData, error: null };
    } catch (error) {
      return {
        data: null,
        error: `HTTP error: ${error.message}`,
      };
    }
  }

  get(url, headers = {}) {
    return this.request(url, "GET", null, headers);
  }

  post(url, data, headers = {}) {
    return this.request(url, "POST", data, headers);
  }

  put(url, data, headers = {}) {
    return this.request(url, "PUT", data, headers);
  }

  delete(url, headers = {}) {
    return this.request(url, "DELETE", null, headers);
  }
}

const serverApi = new ServerApi("/api");
export default serverApi;
