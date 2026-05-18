const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const error = new Error(payload?.message || "Request failed");
    error.details = payload?.details || payload;
    throw error;
  }

  return payload;
}

export const api = {
  health: () => request("/health"),
  metrics: () => request("/metrics"),
  dashboard: () => request("/dashboard"),
  kAnalysis: () => request("/k-analysis"),
  clusterPoints: () => request("/clusters/points"),
  clusterSummary: () => request("/clusters/summary"),
  createPrediction: (customerData) =>
    request("/predictions", {
      method: "POST",
      body: JSON.stringify(customerData)
    }),
  predictions: () => request("/predictions"),
  predictionExportUrl: `${API_BASE_URL}/predictions/export.csv`
};
