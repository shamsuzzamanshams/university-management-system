import express from "express";
import { attendanceController } from "./attendance.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { attendanceValidation } from "./attendance.velidation";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";



const router = express.Router();

router.post(
  "/",
  auth(Role.DEPARTMENT_ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR),
  validateRequest(
    attendanceValidation.createAttendanceValidationSchema,
  ),
  attendanceController.createAttendance,
);

router.get(
  "/",
  attendanceController.getAllAttendances,
);

router.get(
  "/:attendanceId",
  attendanceController.getSingleAttendance,
);

router.patch(
  "/:attendanceId",
  validateRequest(
    attendanceValidation.updateAttendanceValidationSchema,
  ),
  attendanceController.updateAttendance,
);

router.delete(
  "/:attendanceId",
  attendanceController.deleteAttendance,
);

export const attendanceRouter = router;