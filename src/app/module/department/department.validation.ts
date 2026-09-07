import { z } from "zod";

/**
 * Zod validation schema for creating a Department
 * Enforced when Super Admin or Department Admin makes a POST request
 */
const createDepartmentZodSchema = z.object({
  body: z.object({
    name: z.string("Department name must be a string.").min(10, "Department name must be at least 10 characters long."),
    
    code: z.string("Department code must be a string.").min(3, "Department code must be at least 2 characters long.").toUpperCase(), // Automatically capitalizes input (e.g. "cse" -> "CSE")
  }),
});

/**
 * Zod validation schema for updating a Department
 * Enforced when Super Admin or Department Admin makes a PATCH request
 */
const updateDepartmentZodSchema = z.object({
  body: z.object({
    name: z.string("Department name must be a string.").min(10, "Department name must be at least 10 characters long.")  .optional(), // Fields are optional on patch updates
    
    code: z.string("Department code must be a string.").min(3, "Department code must be at least 2 characters long.").toUpperCase().optional(),}),
});

export const DepartmentValidation = {
  createDepartmentZodSchema,
  updateDepartmentZodSchema,
};
