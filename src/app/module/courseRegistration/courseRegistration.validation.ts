import { z } from "zod";

const registerCoursesZodSchema = z.object({
  body: z.object({
    academicSemesterId: z.string( "Academic Semester ID is required."),
    academicYear: z.number(
       "Academic Year is required."),
    semesterNumber: z.number(
       "Semester Number is required."),
    // 🧠 FIX: Enforces a minimum of 8 items and a maximum of 8 items in the array
    courses: z
      .array(
        z.object({
          courseId: z.string( "Course ID is required." ),
          sectionId: z.string( "Section ID is required." ),
        })
      )
      .min(8, "Registration failed! You must select exactly 8 courses.")
      .max(8, "Registration failed! You cannot select more than 8 courses."),
  }),
});

export const CourseRegistrationValidation = {
  registerCoursesZodSchema,
};
