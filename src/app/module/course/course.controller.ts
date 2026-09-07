import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
// import sendResponse from "../../utils/sendResponse";
import { CourseService } from "./course.service";
import { sendResponse } from "../../utils/sendResponse";

const createCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await CourseService.createCourse(req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Academic course created successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await CourseService.getAllCourses(req.query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Courses fetched successfully!",
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

const getSingleCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await CourseService.getSingleCourse(id as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Course details retrieved successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await CourseService.updateCourse(id as string, req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Course parameters updated successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await CourseService.deleteCourse(id as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Course record deleted permanently!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const CourseController = {
  createCourse,
  getAllCourses,
  getSingleCourse,
  updateCourse,
  deleteCourse,
};
