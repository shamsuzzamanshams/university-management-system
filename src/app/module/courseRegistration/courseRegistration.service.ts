// import { Prisma, EnrollmentStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { ICourseRegistrationPayload } from "./courseRegistration.interface";
import { EnrollmentStatus } from "../../../generated/prisma/enums";
import { string } from "zod";



/**
 * Handle Student Course Registration Submission
 */
const registerCourses = async (userId: string, payload: ICourseRegistrationPayload) => {
  const { semesterId, academicYear, semester, courses } = payload;

  // 1. Fetch the Student profile along with their assigned Program
  const student = await prisma.student.findUnique({
    where: { userId },
    include: { program: true },
  });

  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student profile not found.");
  }

  if (!student.programId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Student is not assigned to any academic program.");
  }

  // 2. Validate the Semester Rule (Total 8 semesters max)
  if (semester < 1 || semester > 8) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid semester selection. Valid range is 1-8.");
  }

  // 3. Enforce the Course Count Limitation Rule (Maximum 8 choices out of 10)
  if (courses.length > 8) {
    throw new AppError(
      httpStatus.BAD_REQUEST, 
      "Registration failed. You can select a maximum of 8 courses per semester."
    );
  }

  // 4. Fetch the details of all requested courses to validate credits
  const requestedCourseIds = courses.map((c) => c.courseId);
  const dbCourses = await prisma.course.findMany({
    where: {
      id: { in: requestedCourseIds },
      // Natively scopes standard lookups straight into the target programmatic degree chart
      program: {
        some: {
          id: student.programId,
        },
      },
    },
  });

  if (dbCourses.length !== courses.length) {
    throw new AppError(httpStatus.BAD_REQUEST, "One or more selected courses are invalid for your program.");
  }

  // 5. Calculate cumulative completed and currently requested credits
  const requestedCredits = dbCourses.reduce((sum, course) => sum + (course.credits || 0), 0);

  // Fetch historically completed credits matching BOTH semester bounds AND the student's explicit program
  const pastRegistrations = await prisma.courseEnrollment.findMany({
    where: {
      studentId: student.id,
      status: EnrollmentStatus.ENROLLED,
      NOT: { semesterId }, // Exclude current term modifications if re-submitting
      // 🚀 ADDED: Explicit filter validation using nested course relationships
      course: {
        program: {
          some: {
            id: student.programId
          }
        }
      }
    },
    include: { course: true },
  });

  const completedCredits = pastRegistrations.reduce((sum, reg) => sum + (reg.course?.credits || 0), 0);

  // Enforce global ceiling cap constraint (162 Credits)
  if (completedCredits + requestedCredits > 162) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Credit limit exceeded. Completing this selection pushes your total to ${completedCredits + requestedCredits} credits, exceeding the mandatory graduation threshold of 162 credits.`
    );
  }

  // 6. Execute Registration Transactionally inside the Database
  const registrationResult = await prisma.$transaction(async (transactionClient) => {
    // Clean out any existing draft registrations for this specific semester and program tracking matrix
    await transactionClient.courseEnrollment.deleteMany({
      where: {
        studentId: student.id,
        semesterId,
        // 🚀 ADDED: Scope cleanup step to explicitly safeguard alternate/historical program configurations
        course: {
          program: {
            some: {
              id: student.programId as string
            }
          }
        }
      },
    });

    // Bulk create registration nodes
    const enrollmentData = courses.map((c) => ({
      studentId: student.id,
      courseId: c.courseId,
      sectionId: c.sectionId,
      semesterId,
      academicYear,
      semester,
      status: EnrollmentStatus.ENROLLED,
    }));

    return await transactionClient.courseEnrollment.createMany({
      data: enrollmentData,
    });
  });

  return {
    message: "Courses registered successfully!",
    totalRequestedCourses: courses.length,
    semesterCredits: requestedCredits,
    projectedTotalCredits: completedCredits + requestedCredits,
  };
};

/**
 * Retrieve current logged-in student's active semester selections
 */
const getMyRegisteredCourses = async (userId: string, academicSemesterId: string) => {
  const student = await prisma.student.findUnique({
    where: { userId },
  });

  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student profile not found.");
  }

  const registrations = await prisma.courseEnrollment.findMany({
    where: {
      studentId: student.id,
      academicSemesterId,
    },
    include: {
      course: true,
      section: true,
    },
  });

  return registrations;
};

export const CourseRegistrationService = {
  registerCourses,
  getMyRegisteredCourses,
};
