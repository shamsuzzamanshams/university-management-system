import express from "express";
import { sectionController } from "./section.controller";
// import validateRequest from "../../middleware/validateRequest";
import { sectionValidation } from "./section.validation";
import { validateRequest } from "../../middleware/validateRequest";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";


const router = express.Router();

router.post(
  "/",
  auth(Role.DEPARTMENT_ADMIN, Role.SUPER_ADMIN),
  validateRequest(
    sectionValidation.createSectionValidationSchema,
  ),
  sectionController.createSection,
);

router.get(
  "/",
  sectionController.getAllSections,
);

router.get(
  "/:sectionId",
  sectionController.getSingleSection,
);

router.patch(
  "/:sectionId",
  validateRequest(
    sectionValidation.updateSectionValidationSchema,
  ),
  sectionController.updateSection,
);

router.delete(
  "/:sectionId",
  sectionController.deleteSection,
);

export const sectionRouter = router;