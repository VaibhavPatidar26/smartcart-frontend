import mongoose from "mongoose";

// mongoose.set("bufferCommands", false);

// function buildMongoUri() {
//   if (process.env.MONGO_URI) return process.env.MONGO_URI;

//   const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_CLUSTER } = process.env;
//   const database = process.env.MONGO_DB || "smartcart_db";

//   if (!MONGO_USERNAME || !MONGO_PASSWORD || !MONGO_CLUSTER) return null;

//   const username = encodeURIComponent(MONGO_USERNAME);
//   const password = encodeURIComponent(MONGO_PASSWORD);
//   return `mongodb+srv://${username}:${password}@${MONGO_CLUSTER}/${database}?retryWrites=true&w=majority`;
// }

export async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI

  if (!mongoUri) {
    console.warn("MongoDB environment variables are not set. Prediction persistence will be unavailable.");
    return false;
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
  return true;
}
