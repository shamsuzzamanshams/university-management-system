import httpStatus from "http-status";
import {
  ICreateAttendance,
  IUpdateAttendance,
} from "./attendance.interface";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";

const createAttendance = async (
  payload: ICreateAttendance,
) => {
  // Check student
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

  // Check section
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

  // Check if student already has attendance for this section/date
  const existingAttendance =
    await prisma.attendance.findFirst({
      where: {
        studentId: payload.studentId,
        sectionId: payload.sectionId,
        date: payload.date,
      },
    });

  if (existingAttendance) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Attendance already exists for this student on this date",
    );
  }

  const attendance = await prisma.attendance.create({
    data: {
      date: payload.date,
      status: payload.status,
      studentId: payload.studentId,
      sectionId: payload.sectionId,
      remarks: payload.remarks,
    },
    include: {
      student: true,
      section: true,
    },
  });

  return attendance;
};

const getAllAttendances = async () => {
  const attendances = await prisma.attendance.findMany({
    include: {
      student: true,
      section: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  return attendances;
};

const getSingleAttendance = async (
  attendanceId: string,
) => {
  const attendance = await prisma.attendance.findUnique({
    where: {
      id: attendanceId,
    },
    include: {
      student: true,
      section: true,
    },
  });

  if (!attendance) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Attendance not found",
    );
  }

  return attendance;
};

const updateAttendance = async (
  attendanceId: string,
  payload: IUpdateAttendance,
) => {
  const attendance =
    await prisma.attendance.findUnique({
      where: {
        id: attendanceId,
      },
    });

  if (!attendance) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Attendance not found",
    );
  }

  // Check student if studentId is being changed
  if (payload.studentId) {
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
  }

  // Check section if sectionId is being changed
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

  // Check duplicate attendance
  if (
    payload.date ||
    payload.studentId ||
    payload.sectionId
  ) {
    const date = payload.date ?? attendance.date;
    const studentId =
      payload.studentId ?? attendance.studentId;
    const sectionId =
      payload.sectionId ?? attendance.sectionId;

    const existingAttendance =
      await prisma.attendance.findFirst({
        where: {
          studentId,
          sectionId,
          date,
          NOT: {
            id: attendanceId,
          },
        },
      });

    if (existingAttendance) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Attendance already exists for this student on this date",
      );
    }
  }

  const updatedAttendance =
    await prisma.attendance.update({
      where: {
        id: attendanceId,
      },
      data: payload,
      include: {
        student: true,
        section: true,
      },
    });

  return updatedAttendance;
};

const deleteAttendance = async (
  attendanceId: string,
) => {
  const attendance =
    await prisma.attendance.findUnique({
      where: {
        id: attendanceId,
      },
    });

  if (!attendance) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Attendance not found",
    );
  }

  const deletedAttendance =
    await prisma.attendance.delete({
      where: {
        id: attendanceId,
      },
    });

  return deletedAttendance;
};

export const attendanceService = {
  createAttendance,
  getAllAttendances,
  getSingleAttendance,
  updateAttendance,
  deleteAttendance,
};