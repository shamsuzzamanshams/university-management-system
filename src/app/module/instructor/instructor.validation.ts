import { z } from "zod";

export const applyAsInstructorSchema = z.object({
  user: z.object({
    name: z.string(),
    email: z.string().email(),
  }),

  instructor: z.object({
    designation: z.string(),
    departmentId: z.string(),
  }),
});

