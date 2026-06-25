declare module "express" {
  interface Request {
    user?: {
      id: string;
      clerkId: string;
      email: string;
      role: string;
      agencyId: string;
    };
  }
}

export {};
