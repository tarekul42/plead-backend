import express from "express";
import cors from "cors";
import { env } from "./core/config/env";
import { requestLogger } from "./core/middleware/request-logger.middleware";
import { globalRateLimit } from "./core/middleware/rate-limit.middleware";
import { notFound } from "./core/middleware/not-found.middleware";
import { errorHandler } from "./core/middleware/error-handler.middleware";

import { propertiesRouter } from "./modules/properties";
import { leadsRouter } from "./modules/leads";
import { interactionsRouter } from "./modules/interactions";
import { reviewsRouter } from "./modules/reviews";
import { blogsRouter } from "./modules/blogs";
import { aiRouter } from "./modules/ai";
import { adminRouter } from "./modules/admin";
import { webhooksRouter } from "./modules/webhooks";
import { usersRouter } from "./modules/users";

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN.split(","), credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(globalRateLimit);

app.get("/health", (_req, res) => res.json({ status: "ok", timestamp: Date.now() }));

app.use("/api/v1/webhooks", webhooksRouter);
app.use("/api/v1/properties", propertiesRouter);
app.use("/api/v1/leads", leadsRouter);
app.use("/api/v1/interactions", interactionsRouter);
app.use("/api/v1/reviews", reviewsRouter);
app.use("/api/v1/blog", blogsRouter);
app.use("/api/v1/ai", aiRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/users", usersRouter);

app.use(notFound);
app.use(errorHandler);

export { app };
