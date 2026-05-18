const DEFAULT_ML_API_URL = "http://localhost:8000";

export class MlApiError extends Error {
  constructor(message, status = 502, details = null) {
    super(message);
    this.name = "MlApiError";
    this.status = status;
    this.details = details;
  }
}

function mlApiBaseUrl() {
  return (process.env.ML_API_URL || DEFAULT_ML_API_URL).replace(/\/$/, "");
}

export async function callMlApi(path, options = {}) {
  const response = await fetch(`${mlApiBaseUrl()}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    throw new MlApiError("ML API request failed", response.status, payload);
  }

  return payload;
}
