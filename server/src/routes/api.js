import { Router } from "express";

import { CustomerPrediction } from "../models/CustomerPrediction.js";
import { callMlApi } from "../services/mlClient.js";
import { predictionsToCsv } from "../utils/csv.js";

export const apiRouter = Router();

function mapMlPrediction(prediction) {
  return {
    clusterId: prediction.cluster_id,
    clusterName: prediction.cluster_name,
    description: prediction.description,
    recommendations: prediction.recommendations
  };
}

function asyncRoute(handler) {
  return (request, response, next) => Promise.resolve(handler(request, response, next)).catch(next);
}

apiRouter.get("/ping", (_request, response) => {
  response.json({ status: "ok", service: "smartcart-express-api" });
});

apiRouter.get(
  "/health",
  asyncRoute(async (_request, response) => {
    let ml = { status: "unavailable" };

    try {
      ml = await callMlApi("/health");
    } catch (error) {
      ml = { status: "unavailable", message: error.message };
    }

    response.json({
      status: "ok",
      service: "smartcart-express-api",
      ml
    });
  })
);

apiRouter.get("/metrics", asyncRoute(async (_request, response) => response.json(await callMlApi("/metrics"))));
apiRouter.get("/dashboard", asyncRoute(async (_request, response) => response.json(await callMlApi("/dashboard"))));
apiRouter.get("/k-analysis", asyncRoute(async (_request, response) => response.json(await callMlApi("/k-analysis"))));
apiRouter.get("/clusters/points", asyncRoute(async (_request, response) => response.json(await callMlApi("/clusters/points"))));
apiRouter.get("/clusters/names", asyncRoute(async (_request, response) => response.json(await callMlApi("/clusters/names"))));
apiRouter.get("/clusters/summary", asyncRoute(async (_request, response) => response.json(await callMlApi("/clusters/summary"))));

apiRouter.post(
  "/predictions",
  asyncRoute(async (request, response) => {
    const mlPrediction = await callMlApi("/predict", {
      method: "POST",
      body: JSON.stringify(request.body)
    });

    const document = await CustomerPrediction.create({
      customerData: request.body,
      prediction: mapMlPrediction(mlPrediction)
    });

    response.status(201).json(document);
  })
);

apiRouter.get(
  "/predictions",
  asyncRoute(async (_request, response) => {
    const predictions = await CustomerPrediction.find({}).sort({ createdAt: -1 }).lean();
    response.json(predictions);
  })
);

apiRouter.delete(
  "/predictions/:id",
  asyncRoute(async (request, response) => {
    if (!/^[0-9a-fA-F]{24}$/.test(request.params.id)) {
      return response.status(400).json({ message: "Invalid saved prediction id" });
    }

    const deletedPrediction = await CustomerPrediction.findByIdAndDelete(request.params.id).lean();

    if (!deletedPrediction) {
      return response.status(404).json({ message: "Saved prediction not found" });
    }

    return response.json({ message: "Saved prediction deleted", id: request.params.id });
  })
);

apiRouter.get(
  "/predictions/export.csv",
  asyncRoute(async (_request, response) => {
    const predictions = await CustomerPrediction.find({}).sort({ createdAt: -1 }).lean();
    response.header("Content-Type", "text/csv");
    response.attachment("saved_customer_predictions.csv");
    response.send(predictionsToCsv(predictions));
  })
);
