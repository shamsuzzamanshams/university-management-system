import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ProgramService } from "./program.service";
import { sendResponse } from "../../utils/sendResponse";


const createProgram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ProgramService.createProgram(req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Academic Program created successfully!",
      data: result,
    });
  } catch (error) {
    next(error); 
  }
};


const getAllPrograms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ProgramService.getAllPrograms(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Academic Programs fetched successfully!",
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};


const getSingleProgram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await ProgramService.getSingleProgram(id as string);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Academic Program fetched successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


const updateProgram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await ProgramService.updateProgram(id as string, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Academic Program updated successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


const deleteProgram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await ProgramService.deleteProgram(id as string);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Academic Program deleted successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const ProgramController = {
  createProgram,
  getAllPrograms,
  getSingleProgram,
  updateProgram,
  deleteProgram,
};
