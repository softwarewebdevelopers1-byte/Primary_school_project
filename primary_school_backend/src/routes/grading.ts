import { Router } from "express";
import type { Response } from "express";
import { CbcGradingBandModel } from "../models/school.model.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { rolesMapped } from "../models/user.model.js";
import {
  getCbcGradingBands,
  validateCbcGradingBands,
  type CbcGradingBandInput,
} from "../utils/grading.js";

const router = Router();

router.use(authenticate);

const isAdmin = (req: AuthRequest) =>
  Array.isArray(req.user?.roles) && req.user.roles.includes(rolesMapped.ADM);

router.get("/cbc", async (_req: AuthRequest, res: Response) => {
  try {
    res.json(await getCbcGradingBands());
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/cbc", async (req: AuthRequest, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: "Only admins can manage CBC grading configuration." });
    }

    const bands = validateCbcGradingBands(req.body?.bands as CbcGradingBandInput[]);

    await CbcGradingBandModel.deleteMany({});
    await CbcGradingBandModel.insertMany(
      bands.map((band, index) => ({
        minMarks: band.minMarks,
        maxMarks: band.maxMarks,
        cbcBand: band.cbcBand,
        points: band.points,
        sortOrder: index,
        createdBy: req.user?.id || null,
      })),
    );

    res.json({
      message: "CBC grading configuration saved successfully.",
      bands: await getCbcGradingBands(),
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/cbc/validate", async (req: AuthRequest, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: "Only admins can validate CBC grading configuration." });
    }

    const bands = validateCbcGradingBands(req.body?.bands as CbcGradingBandInput[]);
    res.json({ valid: true, bands });
  } catch (error: any) {
    res.status(400).json({ valid: false, message: error.message });
  }
});

export default router;
