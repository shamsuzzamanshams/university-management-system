import { z } from "zod";

const createCourseZodSchema = z.object({
  body: z.object({
    code: z.string("Course institutional code is required.").min(3, "Course code must be at least 3 characters long.").toUpperCase(),
    
    title: z.string("Course title is required.",).min(3, "Course title must be at least 3 characters long."),
    
    credits: z.number("Course credit score is required.",).int("Credits must be a whole integer number.").positive("Credits must be greater than 0."),
    
    description: z.string().optional(),
    
    departmentId: z.string( "Department ID assignment is required.",).uuid("Invalid unique identifier format for Department ID."),
  }),
});

const updateCourseZodSchema = z.object({
  body: z.object({
    code: z.string().min(3).toUpperCase().optional(),
    title: z.string().min(3).optional(),
    credits: z.number().int().positive().optional(),
    description: z.string().optional(),
    departmentId: z.string().uuid().optional(),
  }),
});

export const CourseValidation = {
  createCourseZodSchema,
  updateCourseZodSchema,
};
