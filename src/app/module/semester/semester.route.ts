import express from "express";

import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";

import { SemesterController } from "./semester.controller";
import { SemesterValidation } from "./semester.validation";

import { Role } from "../../../generated/prisma/enums";


const router = express.Router();




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



router.post(
  "/initiate",

  auth(Role.STUDENT),

  validateRequest(
    SemesterValidation.initiateSemesterRegistrationZodSchema
  ),

  SemesterController.initiateSemesterRegistration
);




router.post(
  "/retry-payment",

  auth(Role.STUDENT),

  validateRequest(
    SemesterValidation.payRegistrationFeeZodSchema
  ),

  SemesterController.paySemesterRegistrationFee
);




router.get(
  "/payment/callback",

  SemesterController.bookSemesterPaymentCallback
);



router.get(
  "/",

  SemesterController.getAllSemesters
);




router.get(
  "/:semesterId",

  SemesterController.getSingleSemester
);



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



router.delete(
  "/:semesterId",

  auth(Role.SUPER_ADMIN),

  SemesterController.deleteSemester
);


export const SemesterRoutes = router;