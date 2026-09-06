import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { DepartmentService } from "./department.service";
import { sendResponse } from "../../utils/sendResponse";


const createDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await DepartmentService.createDepartment(req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Department created successfully!",
      data: result,
    });
  } catch (error) {
    next(error); 
  }
};


const getAllDepartments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await DepartmentService.getAllDepartments(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Departments fetched successfully!",
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};


const getSingleDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await DepartmentService.getSingleDepartment(id as string);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Department fetched successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


const updateDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await DepartmentService.updateDepartment(id as string, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Department updated successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


const deleteDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await DepartmentService.deleteDepartment(id as string);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Department deleted successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const DepartmentController = {
  createDepartment,
  getAllDepartments,
  getSingleDepartment,
  updateDepartment,
  deleteDepartment,
};
