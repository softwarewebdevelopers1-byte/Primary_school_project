import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { authRouter } from "./routes/authRoutes";
import { dashboardRouter } from "./routes/dashboardRoutes";

export const app = express();

app.use(
  cors({
    origin: env.clientOrigin,
  }),
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api", dashboardRouter);
