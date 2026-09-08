import { Request, Response } from "express";
import httpStatus from "http-status";
import { attendanceService } from "./attendance.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createAttendance = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await attendanceService.createAttendance(
        req.body,
      );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Attendance created successfully",
      data: result,
    });
  },
);

const getAllAttendances = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await attendanceService.getAllAttendances();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Attendances retrieved successfully",
      data: result,
    });
  },
);

const getSingleAttendance = catchAsync(
  async (req: Request, res: Response) => {
    const { attendanceId } = req.params;

    const result =
      await attendanceService.getSingleAttendance(
        attendanceId as string,
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Attendance retrieved successfully",
      data: result,
    });
  },
);

const updateAttendance = catchAsync(
  async (req: Request, res: Response) => {
    const { attendanceId } = req.params;

    const result =
      await attendanceService.updateAttendance(
        attendanceId as string,
        req.body,
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Attendance updated successfully",
      data: result,
    });
  },
);

const deleteAttendance = catchAsync(
  async (req: Request, res: Response) => {
    const { attendanceId } = req.params;

    const result =
      await attendanceService.deleteAttendance(
        attendanceId as string,
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Attendance deleted successfully",
      data: result,
    });
  },
);

export const attendanceController = {
  createAttendance,
  getAllAttendances,
  getSingleAttendance,
  updateAttendance,
  deleteAttendance,
};