import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

export async function connectDB() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGODB_URI);
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
