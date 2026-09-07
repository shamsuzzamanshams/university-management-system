import { z } from "zod";

/**
 * Validates request payload when initializing a new registration invoice
 * Enforced on POST /api/v1/semester-registration/initiate
 */
const initiateSemesterRegistrationZodSchema = z.object({
  body: z.object({
    semesterId: z.string( "Semester ID is required.",).uuid("Invalid unique identifier format for Semester ID."),
    
    amount: z.number("Payment tuition amount is required.").positive("Payment amount must be greater than 0 BDT."),
    
    description: z.string("Invoice billing description is required.",).min(5, "Description must be at least 5 characters long."),
  }),
});

/**
 * Validates retry checkout payments for existing pending rows
 * Enforced on POST /api/v1/semester-registration/retry-payment
 */
const payRegistrationFeeZodSchema = z.object({
  body: z.object({
    feeId: z.string( "Student Fee Invoice ID is required.",).uuid("Invalid unique identifier format for Student Fee ID."),
  }),
});

export const SemesterValidation = {
  initiateSemesterRegistrationZodSchema,
  payRegistrationFeeZodSchema,
};
