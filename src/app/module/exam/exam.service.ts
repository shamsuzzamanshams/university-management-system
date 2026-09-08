import httpStatus from "http-status";
// import AppError from "../../errors/AppError";
// import prisma from "../../shared/prisma";
import {
  ICreateExam,
  IUpdateExam,
  ICreateExamResult,
  IUpdateExamResult,
} from "./exam.interface";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";

const createExam = async (payload: ICreateExam) => {
  // Check section exists
  const section = await prisma.section.findUnique({
    where: {
      id: payload.sectionId,
    },
  });

  if (!section) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Section not found",
    );
  }

  const result = await prisma.exam.create({
    data: {
      title: payload.title,
      maxMarks: payload.maxMarks,
      weightage: payload.weightage,
      examDate: payload.examDate,
      sectionId: payload.sectionId,
    },
    include: {
      section: true,
    },
  });

  return result;
};

const getAllExams = async () => {
  const result = await prisma.exam.findMany({
    include: {
      section: true,
      results: {
        include: {
          student: true,
        },
      },
    },
    orderBy: {
      examDate: "asc",
    },
  });

  return result;
};

const getSingleExam = async (examId: string) => {
  const exam = await prisma.exam.findUnique({
    where: {
      id: examId,
    },
    include: {
      section: true,
      results: {
        include: {
          student: true,
        },
      },
    },
  });

  if (!exam) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Exam not found",
    );
  }

  return exam;
};

const updateExam = async (
  examId: string,
  payload: IUpdateExam,
) => {
  const exam = await prisma.exam.findUnique({
    where: {
      id: examId,
    },
  });

  if (!exam) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Exam not found",
    );
  }

  if (payload.sectionId) {
    const section = await prisma.section.findUnique({
      where: {
        id: payload.sectionId,
      },
    });

    if (!section) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Section not found",
      );
    }
  }

  const result = await prisma.exam.update({
    where: {
      id: examId,
    },
    data: payload,
    include: {
      section: true,
    },
  });

  return result;
};

const deleteExam = async (examId: string) => {
  const exam = await prisma.exam.findUnique({
    where: {
      id: examId,
    },
  });

  if (!exam) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Exam not found",
    );
  }

  await prisma.exam.delete({
    where: {
      id: examId,
    },
  });

  return null;
};

/* =========================
   EXAM RESULT
========================= */

const createExamResult = async (
  payload: ICreateExamResult,
) => {
  const exam = await prisma.exam.findUnique({
    where: {
      id: payload.examId,
    },
  });

  if (!exam) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Exam not found",
    );
  }

  // Marks cannot exceed max marks
  if (payload.marksObtained > exam.maxMarks) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Marks cannot exceed ${exam.maxMarks}`,
    );
  }

  const student = await prisma.student.findUnique({
    where: {
      id: payload.studentId,
    },
  });

  if (!student) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Student not found",
    );
  }

  const existingResult =
    await prisma.examResult.findUnique({
      where: {
        examId_studentId: {
          examId: payload.examId,
          studentId: payload.studentId,
        },
      },
    });

  if (existingResult) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Exam result already exists for this student",
    );
  }

  const result = await prisma.examResult.create({
    data: {
      marksObtained: payload.marksObtained,
      examId: payload.examId,
      studentId: payload.studentId,
    },
    include: {
      exam: true,
      student: true,
    },
  });

  return result;
};

const getExamResults = async (examId: string) => {
  const exam = await prisma.exam.findUnique({
    where: {
      id: examId,
    },
  });

  if (!exam) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Exam not found",
    );
  }

  const results = await prisma.examResult.findMany({
    where: {
      examId,
    },
    include: {
      student: true,
      exam: true,
    },
    orderBy: {
      marksObtained: "desc",
    },
  });

  return results;
};

const getSingleExamResult = async (
  resultId: string,
) => {
  const result = await prisma.examResult.findUnique({
    where: {
      id: resultId,
    },
    include: {
      exam: true,
      student: true,
    },
  });

  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Exam result not found",
    );
  }

  return result;
};

const updateExamResult = async (
  resultId: string,
  payload: IUpdateExamResult,
) => {
  const existingResult =
    await prisma.examResult.findUnique({
      where: {
        id: resultId,
      },
      include: {
        exam: true,
      },
    });

  if (!existingResult) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Exam result not found",
    );
  }

  if (
    payload.marksObtained !== undefined &&
    payload.marksObtained > existingResult.exam.maxMarks
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Marks cannot exceed ${existingResult.exam.maxMarks}`,
    );
  }

  const result = await prisma.examResult.update({
    where: {
      id: resultId,
    },
    data: payload,
    include: {
      exam: true,
      student: true,
    },
  });

  return result;
};

const deleteExamResult = async (
  resultId: string,
) => {
  const result =
    await prisma.examResult.findUnique({
      where: {
        id: resultId,
      },
    });

  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Exam result not found",
    );
  }

  await prisma.examResult.delete({
    where: {
      id: resultId,
    },
  });

  return null;
};

export const examService = {
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