import { Router } from "express";
import { AuthController } from "./auth.controller";

const authRouter = Router();

authRouter.post("/demo-ticket", AuthController.demo);

export { authRouter };
