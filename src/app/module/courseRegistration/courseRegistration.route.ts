import express from "express";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest"; 
import { CourseRegistrationController } from "./courseRegistration.controller";
import { CourseRegistrationValidation } from "./courseRegistration.validation"; 
import { Role } from "../../../generated/prisma/enums";

const router = express.Router();

router.post(
  "/submit",
  auth(Role.STUDENT),
  validateRequest(CourseRegistrationValidation.registerCoursesZodSchema), 
  CourseRegistrationController.registerCourses
);


router.get(
  "/my-courses",
  auth(Role.STUDENT),
  CourseRegistrationController.getMyRegisteredCourses
);

export const CourseRegistrationRoutes = router;
