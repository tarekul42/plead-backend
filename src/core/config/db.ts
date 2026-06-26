import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

export async function connectDB() {
  mongoose.set("strictQuery", true);
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(env.MONGODB_URI);
      break;
    } catch (err) {
      if (attempt < maxRetries) {
        logger.warn({ attempt }, "MongoDB connection attempt failed, retrying...");
        await new Promise(r => setTimeout(r, attempt * 1000));
      } else {
        logger.fatal({ err }, "MongoDB connection failed after all retries");
        throw err;
      }
    }
  }
  logger.info("MongoDB connected");

  mongoose.connection.on("error", (err) =>
    logger.error({ err }, "MongoDB connection error"),
  );
  mongoose.connection.on("disconnected", () =>
    logger.warn("MongoDB disconnected"),
  );
}

export async function closeDB() {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected on shutdown");
}
