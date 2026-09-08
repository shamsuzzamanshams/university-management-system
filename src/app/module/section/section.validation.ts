import { z } from "zod";

const createSectionValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Section name is required"),

    capacity: z
      .number()
      .int("Capacity must be an integer")
      .positive("Capacity must be greater than 0"),

    roomNumber: z.string().optional(),

    schedule: z.string().min(1, "Schedule is required"),

    semesterId: z.string().uuid("Invalid semester ID"),

    instructorId: z.string().uuid("Invalid instructor ID"),
  }),
});

const updateSectionValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),

    capacity: z
      .number()
      .int("Capacity must be an integer")
      .positive("Capacity must be greater than 0")
      .optional(),

    roomNumber: z.string().optional(),

    schedule: z.string().min(1).optional(),

    semesterId: z.string().uuid("Invalid semester ID").optional(),

    instructorId: z.string().uuid("Invalid instructor ID").optional(),
  }),
});

export const sectionValidation = {
  createSectionValidationSchema,
  updateSectionValidationSchema,
};