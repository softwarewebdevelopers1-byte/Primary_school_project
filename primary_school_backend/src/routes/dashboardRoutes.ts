import { Router } from "express";
import { RoleDatasetModel } from "../models/RoleDataset";

export const dashboardRouter = Router();

const routeMap: Record<string, string> = {
  "/admin/dashboard": "admin",
  "/teacher/dashboard": "teacher",
  "/deputy-teacher/dashboard": "deputy-teacher",
  "/subject-teacher/dashboard": "subject-teacher",
};

Object.entries(routeMap).forEach(([path, key]) => {
  dashboardRouter.get(path, async (_req, res) => {
    const dataset = await RoleDatasetModel.findOne({ key }).lean();

    if (!dataset) {
      res.status(404).json({ message: `No dataset found for ${key}.` });
      return;
    }

    res.json(dataset.payload);
  });
});
