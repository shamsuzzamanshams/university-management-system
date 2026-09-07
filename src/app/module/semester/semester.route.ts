import express from "express";
// import { Role } from "@prisma/client";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { SemesterController } from "./semester.controller";
import { SemesterValidation } from "./semester.validation"; // Import validation object
import { Role } from "../../../generated/prisma/enums";

const router = express.Router();

router.post(
  "/create-semester",
  auth(Role.SUPER_ADMIN, Role.DEPARTMENT_ADMIN),
  SemesterController.createSemester
);

// 1. Route to initialize an invoice and generate a dynamic bKash checkout link
router.post(
  "/initiate",
  auth(Role.STUDENT),
//   validateRequest(SemesterValidation.initiateSemesterRegistrationZodSchema), // <-- Injected here
  SemesterController.initiateSemesterRegistration
);

// 2. Route to retry payment processing for existing pending UNPAID fee rows
router.post(
  "/retry-payment",
  auth(Role.STUDENT),
  validateRequest(SemesterValidation.payRegistrationFeeZodSchema), // <-- Injected here
  SemesterController.paySemesterRegistrationFee
);

// 3. Callback webhook handler directly invoked by bKash servers (No validation layer needed)
router.get(
  "/payment/callback",
  SemesterController.bookSemesterPaymentCallback
);

export const SemesterRoutes = router;
