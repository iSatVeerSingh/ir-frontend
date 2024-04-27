class ClientApi {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(url, method = "GET", data = null, headers = {}) {
    try {
      const endpoint = this.baseUrl + url;

      const config = {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...headers,
        },
      };

      if (data) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(endpoint, config);
      const responseData = await response.json();
      if (!response.ok) {
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
      return {
        data: null,
        error: `HTTP Error: ${err?.message}`,
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

export default new ClientApi("/client");
