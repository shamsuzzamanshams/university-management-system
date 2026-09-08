// import { prisma } from "../../shared/prisma";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { ICreateSection, IUpdateSection } from "./section.interface";
// import { AppError } from "../../errors/AppError";
import httpStatus from "http-status";

const createSection = async (payload: ICreateSection) => {
  // Check semester
  const semester = await prisma.semester.findUnique({
    where: {
      id: payload.semesterId,
    },
  });

  if (!semester) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Semester not found",
    );
  }

  // Check instructor
  const instructor = await prisma.instructor.findUnique({
    where: {
      id: payload.instructorId,
    },
  });

  if (!instructor) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Instructor not found",
    );
  }

  // Check duplicate section
  const existingSection = await prisma.section.findFirst({
    where: {
      semesterId: payload.semesterId,
      name: payload.name,
    },
  });

  if (existingSection) {
    throw new AppError(
      httpStatus.CONFLICT,
      "This section already exists in this semester",
    );
  }

  const section = await prisma.section.create({
    data: {
      name: payload.name,
      capacity: payload.capacity,
      roomNumber: payload.roomNumber,
      schedule: payload.schedule,
      semesterId: payload.semesterId,
      instructorId: payload.instructorId,
    },
    include: {
      exams: true,
      attendances: true,
    },
  });

  return section;
};

const getAllSections = async () => {
  const sections = await prisma.section.findMany({
    include: {
      exams: true,
      attendances: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return sections;
};

const getSingleSection = async (sectionId: string) => {
  const section = await prisma.section.findUnique({
    where: {
      id: sectionId,
    },
    include: {
      exams: true,
      attendances: true,
    },
  });

  if (!section) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Section not found",
    );
  }

  return section;
};

const updateSection = async (
  sectionId: string,
  payload: IUpdateSection,
) => {
  const section = await prisma.section.findUnique({
    where: {
      id: sectionId,
    },
  });

  if (!section) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Section not found",
    );
  }

  // If semester is changing, verify it exists
  if (payload.semesterId) {
    const semester = await prisma.semester.findUnique({
      where: {
        id: payload.semesterId,
      },
    });

    if (!semester) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Semester not found",
      );
    }
  }

  // If instructor is changing, verify it exists
  if (payload.instructorId) {
    const instructor = await prisma.instructor.findUnique({
      where: {
        id: payload.instructorId,
      },
    });

    if (!instructor) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Instructor not found",
      );
    }
  }

  // Check duplicate name inside same semester
  if (payload.name || payload.semesterId) {
    const semesterId =
      payload.semesterId ?? section.semesterId;

    const name =
      payload.name ?? section.name;

    const existingSection = await prisma.section.findFirst({
      where: {
        semesterId,
        name,
        NOT: {
          id: sectionId,
        },
      },
    });

    if (existingSection) {
      throw new AppError(
        httpStatus.CONFLICT,
        "This section already exists in this semester",
      );
    }
  }

  const updatedSection = await prisma.section.update({
    where: {
      id: sectionId,
    },
    data: payload,
    include: {
      exams: true,
      attendances: true,
    },
  });

  return updatedSection;
};

const deleteSection = async (sectionId: string) => {
  const section = await prisma.section.findUnique({
    where: {
      id: sectionId,
    },
  });

  if (!section) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Section not found",
    );
  }

  const deletedSection = await prisma.section.delete({
    where: {
      id: sectionId,
    },
  });

  return deletedSection;
};

export const sectionService = {
  createSection,
  getAllSections,
  getSingleSection,
  updateSection,
  deleteSection,
};