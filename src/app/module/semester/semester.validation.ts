import { z } from "zod";


// =====================================================
// CREATE SEMESTER
// =====================================================

const createSemesterZodSchema = z.object({
  body: z.object({
    name: z
      .string("Semester name is required.")
      .min(1, "Semester name cannot be empty."),

    code: z
      .string("Semester code is required.")
      .min(1, "Semester code cannot be empty.")
      .max(20, "Semester code cannot exceed 20 characters."),

    startDate: z.coerce.date(
      "Valid start date is required."
    ),

    endDate: z.coerce.date(
      "Valid end date is required."
    ),

    registrationOpen: z
      .boolean()
      .optional(),
  }),
});


// =====================================================
// UPDATE SEMESTER
// =====================================================

const updateSemesterZodSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Semester name cannot be empty.")
      .optional(),

    code: z
      .string()
      .min(1, "Semester code cannot be empty.")
      .max(20, "Semester code cannot exceed 20 characters.")
      .optional(),

    startDate: z
      .coerce
      .date()
      .optional(),

    endDate: z
      .coerce
      .date()
      .optional(),

    registrationOpen: z
      .boolean()
      .optional(),
  }),
});


// =====================================================
// INITIATE SEMESTER REGISTRATION
// =====================================================

const initiateSemesterRegistrationZodSchema = z.object({
  body: z.object({
    semesterId: z
      .string("Semester ID is required.")
      .uuid("Invalid unique identifier format for Semester ID."),

    amount: z
      .number("Payment tuition amount is required.")
      .positive("Payment amount must be greater than 0 BDT."),

    description: z
      .string("Invoice billing description is required.")
      .min(
        5,
        "Description must be at least 5 characters long."
      ),
  }),
});


// =====================================================
// RETRY PAYMENT
// =====================================================

const payRegistrationFeeZodSchema = z.object({
  body: z.object({
    feeId: z
      .string("Student Fee Invoice ID is required.")
      .uuid("Invalid unique identifier format for Student Fee ID."),
  }),
});


// =====================================================
// EXPORT
// =====================================================

export const SemesterValidation = {
  createSemesterZodSchema,
  updateSemesterZodSchema,

  initiateSemesterRegistrationZodSchema,
  payRegistrationFeeZodSchema,
};