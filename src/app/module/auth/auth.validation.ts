import z from "zod";

// Updated: Changed from Patient to Student registration setup
const StudentRegistrationZodSchema = z.object({
	name: z.string("Not A String").min(3, "Name Must atleast 3 charecter long").max(30),
	email: z.email("Not a Email"),
	password:z.string()
		.min(8,"Password must be 8 chatecter long")
		.regex(/[A-Z]/, "password must be contain 1 Upper case letter")
    	.regex(/[a-z]/, "password must be contain 1 lower case letter")
      	.regex(/[0-9]/, "password must be contain 1 Number")
      	.regex(/[^A-Za-z0-9]/, "password must be contain 1 statial number"),
});

// Updated: Renamed to match the student email verification context
const StudentEmailVerifyZodSchema = z.object({
	email: z.email("Not a Email"),
	otp : z.string().length(6)
});

const loginZodSchema = z.object({
	 email: z.email("Not a Email"),
    password:z.string()
		.min(8,"Password must be 8 chatecter long")
		.regex(/[A-Z]/, "password must be contain 1 Upper case letter")
    	.regex(/[a-z]/, "password must be contain 1 lower case letter")
      	.regex(/[0-9]/, "password must be contain 1 Number")
      	.regex(/[^A-Za-z0-9]/, "password must be contain 1 statial number"),
});

const ForgotPasswordZodSchema = z.object({
	email: z.email()
});

const ResetPasswordZodSchema = z.object({
	email: z.email(),
    newPassword: z.string()
        .min(8, "Password Must Minimum 8 Characters Long.")
        .regex(/[a-z]/, "Password must contain atleast 1 Lowercase Letter")
        .regex(/[A-Z]/, "Password must contain atleast 1 Uppercase Letter")

        .regex(/[0-9]/, "Password must contain atleast 1 Number")
        .regex(/[^A-Za-z0-9]/, "Password must contain atleast 1 Special Character"),
    otp : z.string().length(6)
});

export const UserValidation = {
	StudentRegistrationZodSchema,
	StudentEmailVerifyZodSchema,
	loginZodSchema,
	ForgotPasswordZodSchema,
	ResetPasswordZodSchema
};
