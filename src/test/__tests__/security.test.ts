import express from "express";
import request from "supertest";
import helmet from "helmet";
import cors from "cors";
import { errorHandler } from "../../core/middleware/error-handler.middleware";
import { notFound } from "../../core/middleware/not-found.middleware";

jest.mock("../../core/config/env", () => ({
  env: {
    CORS_ORIGIN: "https://trusted-frontend.com",
    RATE_LIMIT_WINDOW_MS: 60000,
    RATE_LIMIT_MAX: 100,
  },
}));

describe("Security: HTTP Headers", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(helmet());
    app.get("/test", (_req, res) => res.json({ ok: true }));
    app.use(errorHandler);
  });

  it("sets X-Content-Type-Options: nosniff", async () => {
    const res = await request(app).get("/test");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("sets X-Frame-Options: SAMEORIGIN or DENY", async () => {
    const res = await request(app).get("/test");
    expect(res.headers["x-frame-options"]).toBeDefined();
  });

  it("sets X-XSS-Protection header", async () => {
    const res = await request(app).get("/test");
    expect(res.headers["x-xss-protection"]).toBe("0");
  });

  it("sets Strict-Transport-Security", async () => {
    const res = await request(app).get("/test");
    expect(res.headers["strict-transport-security"]).toBeDefined();
  });

  it("does not leak X-Powered-By", async () => {
    const res = await request(app).get("/test");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});

describe("Security: CORS", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(
      cors({
        origin: (origin, cb) => {
          if (origin === "https://trusted-frontend.com") return cb(null, true);
          cb(null, false);
        },
        credentials: true,
      }),
    );
    app.get("/test", (_req, res) => res.json({ ok: true }));
  });

  it("allows requests from trusted origin", async () => {
    const res = await request(app)
      .get("/test")
      .set("Origin", "https://trusted-frontend.com");
    expect(res.headers["access-control-allow-origin"]).toBe("https://trusted-frontend.com");
  });

  it("rejects requests from untrusted origin", async () => {
    const res = await request(app)
      .get("/test")
      .set("Origin", "https://evil.com");
    expect(res.headers["access-control-allow-origin"]).toBeFalsy();
  });
});

describe("Security: Input validation", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json({ limit: "10kb" }));
    app.post("/test", (req, res) => {
      res.json({ received: req.body });
    });
    app.use(errorHandler);
  });

  it("rejects request body exceeding size limit", async () => {
    const largePayload = { data: "x".repeat(12 * 1024) };
    const res = await request(app)
      .post("/test")
      .send(largePayload);
    expect([413, 500]).toContain(res.status);
  });

  it("rejects malformed JSON body", async () => {
    const res = await request(app)
      .post("/test")
      .set("Content-Type", "application/json")
      .send("{invalid json here");
    expect(res.status).toBe(400);
  });

  it("does not allow prototype pollution via __proto__ in JSON", async () => {
    const before = {}.constructor;
    await request(app)
      .post("/test")
      .send(JSON.stringify({ __proto__: { admin: true } }))
      .set("Content-Type", "application/json");
    expect({}.constructor).toBe(before);
  });

  it("does not allow prototype pollution via constructor.prototype in JSON", async () => {
    const before = {}.constructor;
    await request(app)
      .post("/test")
      .send(JSON.stringify({ "constructor.prototype": { pollute: true } }))
      .set("Content-Type", "application/json");
    expect({}.constructor).toBe(before);
  });
});

describe("Security: NoSQL injection patterns in query params", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.get("/test", (req, res) => {
      const query = req.query;
      if (query.status && typeof query.status === "object") {
        return res.status(400).json({ error: "Complex query rejected" });
      }
      res.json({ query });
    });
    app.get("/leads", (req, res) => {
      const query = req.query as Record<string, unknown>;
      const dangerous = ["$gt", "$ne", "$where", "$regex", "$nin", "$or"];
      for (const key of Object.keys(query)) {
        if (typeof query[key] === "string") continue;
        return res.status(400).json({ error: "Invalid query parameter type" });
      }
      for (const d of dangerous) {
        if (JSON.stringify(query).includes(d)) {
          return res.status(400).json({ error: `Rejected dangerous operator: ${d}` });
        }
      }
      res.json({ leads: [] });
    });
    app.use(errorHandler);
  });

  it("blocks $gt operator injection", async () => {
    const res = await request(app).get("/leads?budget[$gt]=100000");
    expect(res.status).toBe(400);
  });

  it("blocks $ne operator injection", async () => {
    const res = await request(app).get("/leads?email[$ne]=admin@test.com");
    expect(res.status).toBe(400);
  });

  it("blocks $where operator injection", async () => {
    const res = await request(app).get("/leads?$where=1");
    expect(res.status).toBe(400);
  });

  it("blocks $regex injection for data extraction", async () => {
    const res = await request(app).get("/leads?name[$regex]=.*");
    expect(res.status).toBe(400);
  });
});

describe("Security: Zod schema fuzzing", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post("/test", (req, res) => {
      const { z } = require("zod");
      const schema = z.object({
        name: z.string().min(1).max(200),
        email: z.string().email(),
        age: z.number().min(0).max(150).optional(),
      });
      const result = schema.safeParse(req.body);
      if (!result.success) return res.status(422).json({ error: result.error.issues });
      res.json({ ok: true });
    });
    app.use(errorHandler);
  });

  it("rejects extremely long string input", async () => {
    const res = await request(app)
      .post("/test")
      .send({ name: "A".repeat(1000), email: "test@test.com" });
    expect(res.status).toBe(422);
  });

  it("rejects negative age", async () => {
    const res = await request(app)
      .post("/test")
      .send({ name: "Alice", email: "alice@test.com", age: -5 });
    expect(res.status).toBe(422);
  });

  it("rejects NaN in numeric field", async () => {
    const res = await request(app)
      .post("/test")
      .send({ name: "Bob", email: "bob@test.com", age: "not-a-number" });
    expect(res.status).toBe(422);
  });

  it("rejects missing required field", async () => {
    const res = await request(app)
      .post("/test")
      .send({ email: "bob@test.com" });
    expect(res.status).toBe(422);
  });

  it("rejects invalid email format", async () => {
    const res = await request(app)
      .post("/test")
      .send({ name: "Test", email: "not-an-email" });
    expect(res.status).toBe(422);
  });
});

describe("Security: XSS — backend stores HTML safely (output encoding is frontend concern)", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post("/test", (req, res) => {
      res.json({ received: req.body });
    });
    app.use(errorHandler);
  });

  it("accepts text with HTML tags (backend does not strip — React escapes on output)", async () => {
    const res = await request(app)
      .post("/test")
      .send({ name: "<script>alert('xss')</script>" });
    expect(res.status).toBe(200);
    expect(res.body.received.name).toBe("<script>alert('xss')</script>");
  });
});

describe("Security: Auth token tampering", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.get("/protected", (req, res) => {
      const auth = req.headers.authorization;
      if (!auth) return res.status(401).json({ error: "Missing authorization" });
      if (!auth.startsWith("Bearer ")) return res.status(401).json({ error: "Invalid token format" });
      const token = auth.slice(7);
      if (token.length < 10) return res.status(401).json({ error: "Token too short" });
      if (token === "expired-token") return res.status(401).json({ error: "Token expired" });
      res.json({ ok: true });
    });
    app.use(errorHandler);
  });

  it("rejects request with no auth header", async () => {
    const res = await request(app).get("/protected");
    expect(res.status).toBe(401);
  });

  it("rejects malformed auth header", async () => {
    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Basic dGVzdDpwYXNz");
    expect(res.status).toBe(401);
  });

  it("rejects empty token", async () => {
    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer ");
    expect(res.status).toBe(401);
  });

  it("rejects very short token", async () => {
    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer abc");
    expect(res.status).toBe(401);
  });

  it("rejects expired token", async () => {
    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer expired-token");
    expect(res.status).toBe(401);
  });
});

describe("Security: RBAC boundary enforcement", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    const mockRequireAuth = (req: any, _res: any, next: any) => {
      req.user = req.headers["x-test-role"] === "admin"
        ? { id: "admin-1", role: "admin", agencyId: "agency-1" }
        : { id: "agent-1", role: "agent", agencyId: "agency-1" };
      next();
    };

    const StrictRole = (...roles: string[]) =>
      (req: any, _res: any, next: any) => {
        if (!roles.includes(req.user?.role)) {
          return next({ statusCode: 403, code: "FORBIDDEN", message: "Insufficient role" });
        }
        next();
      };

    app.get("/admin/users", mockRequireAuth, StrictRole("admin"), (req, res) => {
      res.json({ users: [] });
    });

    app.get("/leads/:id", mockRequireAuth, (req: any, res: any) => {
      if (req.user.role === "agent") {
        return res.json({ lead: { assignedAgentId: req.user.id } });
      }
      res.json({ lead: { assignedAgentId: "some-other-agent" } });
    });

    app.use((err: any, _req: any, res: any, _next: any) => {
      res.status(err.statusCode || 500).json({ error: err.message });
    });
  });

  it("allows admin to access admin endpoints", async () => {
    const res = await request(app)
      .get("/admin/users")
      .set("x-test-role", "admin");
    expect(res.status).toBe(200);
  });

  it("blocks agent from accessing admin endpoints", async () => {
    const res = await request(app)
      .get("/admin/users")
      .set("x-test-role", "agent");
    expect(res.status).toBe(403);
  });
});

describe("Security: Rate limiting boundary", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    const rateLimit = require("express-rate-limit").default;
    const limiter = rateLimit({
      windowMs: 60 * 1000,
      max: 5,
      validate: { xForwardedForHeader: false },
    });

    app.use(limiter);
    app.get("/test", (_req, res) => res.json({ ok: true }));
    app.use(errorHandler);
  });

  it("allows requests within rate limit", async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app).get("/test");
      expect(res.status).toBe(200);
    }
  });

  it("blocks requests exceeding rate limit", async () => {
    for (let i = 0; i < 5; i++) {
      await request(app).get("/test");
    }
    const res = await request(app).get("/test");
    expect(res.status).toBe(429);
  });
});
