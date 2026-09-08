import { z } from "zod";

const createAttendanceValidationSchema = z.object({
  body: z.object({
    date: z.coerce.date(),

    status: z.enum([
      "PRESENT",
      "ABSENT",
      "LATE",
      "EXCUSED",
    ]),

    studentId: z.string().uuid("Invalid student ID"),

    sectionId: z.string().uuid("Invalid section ID"),

    remarks: z.string().optional(),
  }),
});

const updateAttendanceValidationSchema = z.object({
  body: z.object({
    date: z.coerce.date().optional(),

    status: z
      .enum([
        "PRESENT",
        "ABSENT",
        "LATE",
        "EXCUSED",
      ])
      .optional(),

    studentId: z.string().uuid("Invalid student ID").optional(),

    sectionId: z.string().uuid("Invalid section ID").optional(),

    remarks: z.string().optional(),
  }),
});

export const attendanceValidation = {
  createAttendanceValidationSchema,
  updateAttendanceValidationSchema,
};