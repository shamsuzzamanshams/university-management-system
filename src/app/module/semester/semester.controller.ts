import {
  NextFunction,
  Request,
  Response,
} from "express";

import httpStatus from "http-status";

import { SemesterService } from "./semester.service";

import { sendResponse } from "../../utils/sendResponse";




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




export const SemesterController = {

  createSemester,
  getAllSemesters,
  getSingleSemester,
  updateSemester,
  deleteSemester,


  initiateSemesterRegistration,
  paySemesterRegistrationFee,
  bookSemesterPaymentCallback,
};