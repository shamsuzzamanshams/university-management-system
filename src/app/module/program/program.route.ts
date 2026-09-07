import express from "express";
import { auth } from "../../middleware/checkAuth"; // Your custom auth middleware
import { ProgramController } from "./program.controller";
import { Role } from "../../../generated/prisma/enums";

const router = express.Router();


router.get(
  "/",
  auth(Role.SUPER_ADMIN, Role.DEPARTMENT_ADMIN, Role.STUDENT, Role.INSTRUCTOR),
  ProgramController.getAllPrograms
);


router.get(
  "/:id",
  auth(Role.SUPER_ADMIN, Role.DEPARTMENT_ADMIN, Role.STUDENT, Role.INSTRUCTOR),
  ProgramController.getSingleProgram
);


router.post(
  "/",
  auth(Role.SUPER_ADMIN, Role.DEPARTMENT_ADMIN),
  ProgramController.createProgram
);


router.patch(
  "/:id",
  auth(Role.SUPER_ADMIN, Role.DEPARTMENT_ADMIN),
  ProgramController.updateProgram
);


router.delete(
  "/:id",
  auth(Role.SUPER_ADMIN),
  ProgramController.deleteProgram
);

export const ProgramRoutes = router;
