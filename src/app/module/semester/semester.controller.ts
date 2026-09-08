import {
  NextFunction,
  Request,
  Response,
} from "express";

import httpStatus from "http-status";

import { SemesterService } from "./semester.service";

import { sendResponse } from "../../utils/sendResponse";


// =====================================================
// CREATE SEMESTER
// =====================================================

const createSemester = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result =
      await SemesterService.createSemester(req.body);

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


// =====================================================
// GET ALL SEMESTERS
// =====================================================

const getAllSemesters = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result =
      await SemesterService.getAllSemesters();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Academic Semesters retrieved successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


// =====================================================
// GET SINGLE SEMESTER
// =====================================================

const getSingleSemester = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { semesterId } = req.params;

    const result =
      await SemesterService.getSingleSemester(
        semesterId as string
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Academic Semester retrieved successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


// =====================================================
// UPDATE SEMESTER
// =====================================================

const updateSemester = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { semesterId } = req.params;

    const result =
      await SemesterService.updateSemester(
        semesterId as string,
        req.body
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Academic Semester updated successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


// =====================================================
// DELETE SEMESTER
// =====================================================

const deleteSemester = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { semesterId } = req.params;

    const result =
      await SemesterService.deleteSemester(
        semesterId as string
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Academic Semester deleted successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


// =====================================================
// INITIATE PAYMENT
// =====================================================

const initiateSemesterRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;

    const result =
      await SemesterService.initiateSemesterRegistration(
        req.body,
        user
      );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message:
        "Semester registration initiated successfully! Redirecting to bKash checkout.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


// =====================================================
// RETRY PAYMENT
// =====================================================

const paySemesterRegistrationFee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;

    const result =
      await SemesterService.paySemesterRegistrationFee(
        req.body,
        user
      );

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


// =====================================================
// Bkash PAYMENT CALLBACK
// =====================================================

const bookSemesterPaymentCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result =
      await SemesterService.bookSemesterPaymentCallback(
        req.query
      );

    res.redirect(result.redirectUrl);
  } catch (error) {
    next(error);
  }
};


// =====================================================
// EXPORT
// =====================================================

export const SemesterController = {
  // CRUD
  createSemester,
  getAllSemesters,
  getSingleSemester,
  updateSemester,
  deleteSemester,

  // Payment
  initiateSemesterRegistration,
  paySemesterRegistrationFee,
  bookSemesterPaymentCallback,
};