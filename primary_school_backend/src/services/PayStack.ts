import { Router } from "express";
import type { Response, Request } from "express";
import type { PaymentService } from "./Types.js";

class PayStack implements PaymentService {
  public validateData(req: Request, res: Response): boolean {
    const message: object = { message: "Invalid input" };
    if (!req.body) {
      res.status(400).json(message);
      return false;
    }
    const amount = req.body.amount;
    const paymentMethod = req.body.paymentMethod;
    if (!amount || !paymentMethod) {
      res.status(400).json(message);
      return false;
    }
    return true;
  }
  public pay(): void {
    // all paystack services will go here
    
    console.log("Paystack is working");
  }
}
const router = Router();
router.post("/Services", (req, res) => {});
export default router;
