import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { upload } from "../../lib/multer";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { instructorController } from "./instructor.controller";
// import { DoctorController } from "./doctor.controller";
// import { UpdateDoctorProfileValidationZodSchema } from "./doctor.validations";
// import { UpdateDoctorProfileValidationZodSchema } from "./doctor.validation";

const router = Router();

router.post(
	"/apply-as-instructor",
	// validateRequest(UserValidation.ResetPasswordZodSchema),
	upload.fields([
		{
			name: "resume",
			maxCount: 1,
		},

		{
			name: "additionalFiles",
			maxCount: 10,
		},
	]),
	instructorController.applyAsInstructor,
);
router.post(
	"/apply-as-doctor/verify-email",
	instructorController.verifyInstructorEmail,
);
router.post(
	"/approve-doctor",
	auth(Role.DEPARTMENT_ADMIN, Role.SUPER_ADMIN),
	instructorController.approveInstructor,
);
router.get(
	"/all-doctors",
	auth(Role.DEPARTMENT_ADMIN, Role.SUPER_ADMIN),
	instructorController.getAllInstructor,
);

router.patch(
	"/update-my-profile",
	auth(Role.INSTRUCTOR),
	instructorController.updateInstructorProfile,
);


export const InstructorRoutes = router;