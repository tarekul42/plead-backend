import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import { app } from "../src/app";
import { env } from "../src/core/config/env";
import { logger } from "../src/core/utils/logger";

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info("Connected to MongoDB from Vercel");
  } catch (error) {
    logger.error({ error }, "Failed to connect to MongoDB in Vercel");
    throw error;
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();
  return app(req as unknown as Request, res as unknown as Response);
}
