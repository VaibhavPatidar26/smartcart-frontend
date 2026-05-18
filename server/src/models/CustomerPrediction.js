import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema(
  {
    clusterId: { type: Number, required: true },
    clusterName: { type: String, required: true },
    description: { type: String, required: true },
    recommendations: [{ type: String, required: true }]
  },
  { _id: false }
);

const customerPredictionSchema = new mongoose.Schema(
  {
    customerData: { type: mongoose.Schema.Types.Mixed, required: true },
    prediction: { type: predictionSchema, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const CustomerPrediction = mongoose.model(
  "CustomerPrediction",
  customerPredictionSchema,
  "customer_predictions"
);
