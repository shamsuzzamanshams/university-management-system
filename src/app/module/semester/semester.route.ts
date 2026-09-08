import express from "express";

import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";

import { SemesterController } from "./semester.controller";
import { SemesterValidation } from "./semester.validation";

import { Role } from "../../../generated/prisma/enums";


const router = express.Router();


// =====================================================
// CREATE SEMESTER
// =====================================================

router.post(
  "/create-semester",

  auth(
    Role.SUPER_ADMIN,
    Role.DEPARTMENT_ADMIN
  ),

  validateRequest(
    SemesterValidation.createSemesterZodSchema
  ),

  SemesterController.createSemester
);


// =====================================================
// INITIATE SEMESTER PAYMENT
// =====================================================

router.post(
  "/initiate",

  auth(Role.STUDENT),

  validateRequest(
    SemesterValidation.initiateSemesterRegistrationZodSchema
  ),

  SemesterController.initiateSemesterRegistration
);


// =====================================================
// RETRY PAYMENT
// =====================================================

router.post(
  "/retry-payment",

  auth(Role.STUDENT),

  validateRequest(
    SemesterValidation.payRegistrationFeeZodSchema
  ),

  SemesterController.paySemesterRegistrationFee
);


// =====================================================
// Bkash PAYMENT CALLBACK
// =====================================================

router.get(
  "/payment/callback",

  SemesterController.bookSemesterPaymentCallback
);


// =====================================================
// GET ALL SEMESTERS
// =====================================================

router.get(
  "/",

  SemesterController.getAllSemesters
);


// =====================================================
// GET SINGLE SEMESTER
// =====================================================

router.get(
  "/:semesterId",

  SemesterController.getSingleSemester
);


// =====================================================
// UPDATE SEMESTER
// =====================================================

router.patch(
  "/:semesterId",

  auth(
    Role.SUPER_ADMIN,
    Role.DEPARTMENT_ADMIN
  ),

  validateRequest(
    SemesterValidation.updateSemesterZodSchema
  ),

  SemesterController.updateSemester
);


// =====================================================
// DELETE SEMESTER
// =====================================================

router.delete(
  "/:semesterId",

  auth(Role.SUPER_ADMIN),

  SemesterController.deleteSemester
);


export const SemesterRoutes = router;