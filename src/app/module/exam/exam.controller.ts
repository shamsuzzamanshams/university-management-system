import httpStatus from "http-status";
// import catchAsync from "../../utils/catchAsync";
// import sendResponse from "../../utils/sendResponse";
import { examService } from "./exam.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createExam = catchAsync(async (req, res) => {
  const result = await examService.createExam(
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Exam created successfully",
    data: result,
  });
});

const getAllExams = catchAsync(async (req, res) => {
  const result = await examService.getAllExams();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Exams retrieved successfully",
    data: result,
  });
});

const getSingleExam = catchAsync(async (req, res) => {
  const { examId } = req.params;

  const result =
    await examService.getSingleExam(examId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Exam retrieved successfully",
    data: result,
  });
});

const updateExam = catchAsync(async (req, res) => {
  const { examId } = req.params;

  const result = await examService.updateExam(
    examId as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Exam updated successfully",
    data: result,
  });
});

const deleteExam = catchAsync(async (req, res) => {
  const { examId } = req.params;

  await examService.deleteExam(examId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Exam deleted successfully",
    data: null,
  });
});

/* =========================
   EXAM RESULT
========================= */

const createExamResult = catchAsync(async (req, res) => {
  const result =
    await examService.createExamResult(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Exam result created successfully",
    data: result,
  });
});

const getExamResults = catchAsync(async (req, res) => {
  const { examId } = req.params;

  const result =
    await examService.getExamResults(examId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Exam results retrieved successfully",
    data: result,
  });
});

const getSingleExamResult = catchAsync(
  async (req, res) => {
    const { resultId } = req.params;

    const result =
      await examService.getSingleExamResult(
        resultId as string,
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Exam result retrieved successfully",
      data: result,
    });
  },
);

const updateExamResult = catchAsync(
  async (req, res) => {
    const { resultId } = req.params;

    const result =
      await examService.updateExamResult(
        resultId as string,
        req.body,
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Exam result updated successfully",
      data: result,
    });
  },
);

const deleteExamResult = catchAsync(
  async (req, res) => {
    const { resultId } = req.params;

    await examService.deleteExamResult(resultId as string);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Exam result deleted successfully",
      data: null,
    });
  },
);

export const examController = {
  createExam,
  getAllExams,
  getSingleExam,
  updateExam,
  deleteExam,

  createExamResult,
  getExamResults,
  getSingleExamResult,
  updateExamResult,
  deleteExamResult,
};