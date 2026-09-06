import express from "express";
// import { Role } from "@prisma/client";
// import checkAuth from "../../middleware/checkAuth"; // Your authentication/authorization middleware
// import validateRequest from "../../middleware/validateRequest"; // Your Zod validation middleware
import { DepartmentController } from "./department.controller";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { DepartmentValidation } from "./department.validation";
import { validateRequest } from "../../middleware/validateRequest";


const router = express.Router();


router.get(
  "/",
  auth(Role.SUPER_ADMIN, Role.DEPARTMENT_ADMIN, Role.STUDENT, Role.INSTRUCTOR),
  DepartmentController.getAllDepartments
);


router.get(
  "/:id",
  auth(Role.SUPER_ADMIN, Role.DEPARTMENT_ADMIN, Role.STUDENT, Role.INSTRUCTOR),
  DepartmentController.getSingleDepartment
);


router.post(
  "/",
  auth(Role.SUPER_ADMIN, Role.DEPARTMENT_ADMIN),
  validateRequest(DepartmentValidation.createDepartmentZodSchema),
  DepartmentController.createDepartment
);


router.patch(
  "/:id",
  auth(Role.SUPER_ADMIN, Role.DEPARTMENT_ADMIN),
  validateRequest(DepartmentValidation.updateDepartmentZodSchema),
  DepartmentController.updateDepartment
);


router.delete(
  "/:id",
  auth(Role.SUPER_ADMIN),
  DepartmentController.deleteDepartment
);

export const DepartmentRoutes = router;
