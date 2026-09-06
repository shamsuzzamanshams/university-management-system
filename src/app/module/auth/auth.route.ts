import { Router } from "express";
import { Role } from "../../../generated/prisma/enums"; // Make sure this matches your client or enum build path
import { auth } from "../../middleware/checkAuth";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { UserValidation } from "./auth.validation";

const router = Router();

// Aligned: Swapped out legacy patient attributes to target Student onboarding flows
router.post(
	"/register", 
	validateRequest(UserValidation.StudentRegistrationZodSchema),
	AuthController.registerStudent
);

router.post(
	"/verify-email", 
	validateRequest(UserValidation.StudentEmailVerifyZodSchema),
	AuthController.verifyStudentEmail
);

router.post(
	"/login", 
	validateRequest(UserValidation.loginZodSchema),
	AuthController.loginUser
);

// Aligned: Updated permission guards to utilize your educational Role configurations
router.get(
	"/me",
	auth(
		Role.SUPER_ADMIN, 
		Role.DEPARTMENT_ADMIN, 
		Role.REGISTRAR, 
		Role.FINANCE_ADMIN, 
		Role.INSTRUCTOR, 
		Role.STUDENT
	),
	AuthController.getMe,
);

router.post("/refresh-token", AuthController.refreshToken);

router.post("/google", AuthController.googleLogin);

router.post(
	"/forgot-password",
	validateRequest(UserValidation.ForgotPasswordZodSchema),
	AuthController.forgotPassword
);

router.post(
	"/reset-password",
	validateRequest(UserValidation.ResetPasswordZodSchema),
	AuthController.resetPassword
);

export const AuthRoutes = router;
