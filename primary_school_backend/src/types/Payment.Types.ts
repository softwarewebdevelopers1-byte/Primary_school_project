import type { Request, Response } from "express";
export interface PaymentService {
  pay(): void;
  validateData(a: Request, b: Response): boolean;
}
