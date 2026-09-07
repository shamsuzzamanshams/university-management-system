import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
// import sendResponse from "../../utils/sendResponse";
import { StudentService } from "./student.service";
import { sendResponse } from "../../utils/sendResponse";

/**
 * Controller to get the currently logged-in student's complete profile layout
 */
const getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!; // Extracted directly from your custom auth middleware payload token
    const result = await StudentService.getMyProfile(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Student profile records retrieved successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to patch update profile attributes, select programs, and upload single/multiple media files
 */
const updateMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;

    // 1. Capture text fields sent directly via the standard JSON body
    const profilePayload = req.body;

    // 2. Fire the streamlined service mutation task engine (No more files passed)
    const result = await StudentService.updateMyProfile(userId, profilePayload);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Student profile updated successfully!",
      data: result,
    });
  } catch (error) {
    next(error); // Validation or schema errors automatically flow to your Global Error Handler
  }
};

export const StudentController = {
  getMyProfile,
  updateMyProfile,
};
