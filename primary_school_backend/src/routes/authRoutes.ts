import { Router } from "express";
import { UserModel } from "../models/User";

export const authRouter = Router();

authRouter.get("/demo-accounts", async (_req, res) => {
  const users = await UserModel.find()
    .sort({ roleLabel: 1 })
    .select("email password role roleLabel dashboardPath availableDashboards name")
    .lean();

  res.json({
    demoAccounts: users.map((user) => ({
      email: user.email,
      password: user.password,
      role: user.role,
      roleLabel: user.roleLabel,
      dashboardPath: user.dashboardPath,
      name: user.name,
      availableDashboards: user.availableDashboards,
    })),
  });
});

authRouter.post("/login", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required." });
    return;
  }

  const user = await UserModel.findOne({ email }).lean();

  if (!user || user.password !== password) {
    res.status(401).json({ message: "Invalid email or password." });
    return;
  }

  res.json({
    user: {
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
      roleLabel: user.roleLabel,
      dashboardPath: user.dashboardPath,
      availableDashboards: user.availableDashboards,
    },
  });
});
