import { z } from "zod";

export const ApplyAsInstructorValidationZodSchema = z.object({
	user: z.object({
		name: z.string().trim().min(2, "Name must be at least 2 characters long"),

		email: z.email("Invalid email address").trim().toLowerCase(),
	}),

});

