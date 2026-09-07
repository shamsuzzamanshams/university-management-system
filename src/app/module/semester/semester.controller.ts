import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
// import sendResponse from "../../utils/sendResponse";
import { SemesterService } from "./semester.service";
import { sendResponse } from "../../utils/sendResponse";


const createSemester = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await SemesterService.createSemester(req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Academic Semester created successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
/**
 * Controller to initialize semester registration and generate bKash payment URL
 */
const initiateSemesterRegistration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!; // Populated by your auth middleware
    const result = await SemesterService.initiateSemesterRegistration(req.body, user);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Semester registration initiated successfully! Redirecting to bKash checkout.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to retry payment processing for an existing UNPAID invoice record
 */
const paySemesterRegistrationFee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const result = await SemesterService.paySemesterRegistrationFee(req.body, user);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Payment link regenerated successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to handle tokenized bKash execution router parameters (Callback Webhook)
 * Redirects the user's browser view based on the returned checkout state parameters
 */
const bookSemesterPaymentCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // bKash returns status parameters in the URL query string (e.g. ?paymentID=xxx&status=success)
    const result = await SemesterService.bookSemesterPaymentCallback(req.query);

    // Redirect the student's browser tab straight back to the frontend target page layout mapping
    res.redirect(result.redirectUrl);
  } catch (error) {
    next(error);
  }
};

export const SemesterController = {
   createSemester,
  initiateSemesterRegistration,
  paySemesterRegistrationFee,
  bookSemesterPaymentCallback,
};
