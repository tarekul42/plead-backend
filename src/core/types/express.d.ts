import type { Role } from "./common.types";

declare module "express" {
  interface Request {
    user?: {
      id: string;
      clerkId: string;
      email: string;
      role: Role;
      agencyId: string;
    };
  }
}

export {};
