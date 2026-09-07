import { z } from "zod";

const registerCoursesZodSchema = z.object({
  body: z.object({
    semesterId: z.string( "Semester ID unique token is required.",),
    academicYear: z.number( "Academic Year index integer number is required."),
    semester: z.number( "Semester index integer parameter is required.",),
    courses: z
      .array(
        z.object({
          // 🚀 FIX: Now tracking only courseId property mapping references
          courseId: z.string("Course ID unique string parameter is required." ),
        })
      )
      .min(8, "Registration failed! You must select exactly 8 courses.")
      .max(8, "Registration failed! You cannot select more than 8 courses."),
  }),
});

export const CourseRegistrationValidation = {
  registerCoursesZodSchema,
};
