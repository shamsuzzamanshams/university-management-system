import express from "express";
import { examController } from "./exam.controller";
// import validateRequest from "../../middlewares/validateRequest";
import { examValidation } from "./exam.validation";
import { validateRequest } from "../../middleware/validateRequest";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";

const router = express.Router();

/* =========================
   EXAM
========================= */

router.post(
  "/",
  auth(Role.DEPARTMENT_ADMIN, Role.SUPER_ADMIN),
  validateRequest(
    examValidation.createExamValidationSchema,
  ),
  examController.createExam,
);

router.get(
  "/",
  examController.getAllExams,
);

router.get(
  "/:examId",
  examController.getSingleExam,
);

router.patch(
  "/:examId",
  validateRequest(
    examValidation.updateExamValidationSchema,
  ),
  examController.updateExam,
);

router.delete(
  "/:examId",
  examController.deleteExam,
);

/* =========================
   EXAM RESULT
========================= */

router.post(
  "/result",
  validateRequest(
    examValidation.createExamResultValidationSchema,
  ),
  examController.createExamResult,
);

router.get(
  "/:examId/results",
  examController.getExamResults,
);

router.get(
  "/result/:resultId",
  examController.getSingleExamResult,
);

router.patch(
  "/result/:resultId",
  validateRequest(
    examValidation.updateExamResultValidationSchema,
  ),
  examController.updateExamResult,
);

router.delete(
  "/result/:resultId",
  examController.deleteExamResult,
);

export const examRouter = router;