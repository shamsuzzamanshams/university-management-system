import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
// import sendResponse from "../../utils/sendResponse";
import { CourseRegistrationService } from "./courseRegistration.service";
import { sendResponse } from "../../utils/sendResponse";

/**
 * Controller to submit course registration selections for a semester
 */
const registerCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extracted directly from your custom auth/checkAuth middleware payload verification step
    const { userId } = req.user!; 
    
    const result = await CourseRegistrationService.registerCourses(userId, req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Semester courses registered successfully!",
      data: result,
    });
  } catch (error) {
    next(error); // Safely forward credit-ceiling or validation errors to the global handler
  }
};

/**
 * Controller to retrieve the currently logged-in student's active semester selections
 */
const getMyRegisteredCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const { academicSemesterId } = req.query;

    if (!academicSemesterId) {
      throw new Error("Academic Semester ID query parameter is required.");
    }

    const result = await CourseRegistrationService.getMyRegisteredCourses(
      userId, 
      academicSemesterId as string
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Your registered courses fetched successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const CourseRegistrationController = {
  registerCourses,
  getMyRegisteredCourses,
};
