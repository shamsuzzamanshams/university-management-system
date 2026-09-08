import { z } from "zod";

const createExamValidationSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, "Exam title is required"),

    maxMarks: z
      .number()
      .positive("Maximum marks must be greater than 0"),

    weightage: z
      .number()
      .min(0, "Weightage cannot be negative")
      .max(100, "Weightage cannot exceed 100"),

    examDate: z.coerce.date(),

    sectionId: z
      .string()
      .uuid("Invalid section ID"),
  }),
});

const updateExamValidationSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1)
      .optional(),

    maxMarks: z
      .number()
      .positive()
      .optional(),

    weightage: z
      .number()
      .min(0)
      .max(100)
      .optional(),

    examDate: z
      .coerce
      .date()
      .optional(),

    sectionId: z
      .string()
      .uuid()
      .optional(),
  }),
});

const createExamResultValidationSchema = z.object({
  body: z.object({
    marksObtained: z
      .number()
      .min(0, "Marks cannot be negative"),

    examId: z
      .string()
      .uuid("Invalid exam ID"),

    studentId: z
      .string()
      .uuid("Invalid student ID"),
  }),
});

const updateExamResultValidationSchema = z.object({
  body: z.object({
    marksObtained: z
      .number()
      .min(0, "Marks cannot be negative"),
  }),
});

export const examValidation = {
  createExamValidationSchema,
  updateExamValidationSchema,
  createExamResultValidationSchema,
  updateExamResultValidationSchema,
};