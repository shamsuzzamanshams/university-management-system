import express from "express";
// import { Role } from "@prisma/client";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { CourseController } from "./course.controller";
import { CourseValidation } from "./course.validation";
import { Role } from "../../../generated/prisma/enums";

const router = express.Router();

router.get(
  "/",
  auth(Role.SUPER_ADMIN, Role.DEPARTMENT_ADMIN, Role.STUDENT, Role.INSTRUCTOR),
  CourseController.getAllCourses
);

router.get(
  "/:id",
  auth(Role.SUPER_ADMIN, Role.DEPARTMENT_ADMIN, Role.STUDENT, Role.INSTRUCTOR),
  CourseController.getSingleCourse
);

router.post(
  "/",
  auth(Role.SUPER_ADMIN, Role.DEPARTMENT_ADMIN),
  validateRequest(CourseValidation.createCourseZodSchema),
  CourseController.createCourse
);

router.patch(
  "/:id",
  auth(Role.SUPER_ADMIN, Role.DEPARTMENT_ADMIN),
  validateRequest(CourseValidation.updateCourseZodSchema),
  CourseController.updateCourse
);

router.delete(
  "/:id",
  auth(Role.SUPER_ADMIN),
  CourseController.deleteCourse
);

export const CourseRoutes = router;
