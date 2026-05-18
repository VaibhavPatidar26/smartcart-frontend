import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";

import { connectDatabase } from "./config/db.js";
import { apiRouter } from "./routes/api.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use("/api", apiRouter);

app.use((request, response) => {
  response.status(404).json({ message: `Route not found: ${request.method} ${request.originalUrl}` });
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(error.status || 500).json({
    message: error.message || "Unexpected server error",
    details: error.details || null
  });
});

connectDatabase()
  .catch((error) => {
    console.error("MongoDB connection failed", error);
  })
  .finally(() => {
    app.listen(port, () => {
      console.log(`SmartCart Express API running on http://localhost:${port}`);
    });
  });
