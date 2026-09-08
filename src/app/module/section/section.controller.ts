import { Request, Response } from "express";
// import catchAsync from "../../shared/catchAsync";
// import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { sectionService } from "./section.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createSection = catchAsync(
  async (req: Request, res: Response) => {
    const result = await sectionService.createSection(
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Section created successfully",
      data: result,
    });
  },
);

const getAllSections = catchAsync(
  async (req: Request, res: Response) => {
    const result = await sectionService.getAllSections();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Sections retrieved successfully",
      data: result,
    });
  },
);

const getSingleSection = catchAsync(
  async (req: Request, res: Response) => {
    const { sectionId } = req.params;

    const result =
      await sectionService.getSingleSection(sectionId as string);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Section retrieved successfully",
      data: result,
    });
  },
);

const updateSection = catchAsync(
  async (req: Request, res: Response) => {
    const { sectionId } = req.params;

    const result = await sectionService.updateSection(
      sectionId as string,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Section updated successfully",
      data: result,
    });
  },
);

const deleteSection = catchAsync(
  async (req: Request, res: Response) => {
    const { sectionId } = req.params;

    const result =
      await sectionService.deleteSection(sectionId as string);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Section deleted successfully",
      data: result,
    });
  },
);

export const sectionController = {
  createSection,
  getAllSections,
  getSingleSection,
  updateSection,
  deleteSection,
};