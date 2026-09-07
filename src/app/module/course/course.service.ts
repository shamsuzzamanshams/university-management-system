// import { Prisma, Course } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { ICourseCreatePayload, ICourseFilterRequest } from "./course.interface";
import { IQuery } from "../../interfaces";
import { Course, Prisma } from "../../../generated/prisma/client";

/**
 * Instantiate a New Academic Course Module
 */
const createCourse = async (payload: ICourseCreatePayload): Promise<Course> => {
  // 1. Guard against duplicate institutional class codes
  const isCourseCodeExists = await prisma.course.findUnique({
    where: { code: payload.code.toUpperCase().trim() },
  });

  if (isCourseCodeExists) {
    throw new AppError(
      httpStatus.CONFLICT,
      `An academic course record already exists with the code '${payload.code}'.`
    );
  }

  // 2. Verify assigned parent department exists
  const departmentExists = await prisma.department.findUnique({
    where: { id: payload.departmentId },
  });
  if (!departmentExists) {
    throw new AppError(httpStatus.NOT_FOUND, "The assigned parent department does not exist.");
  }

  // 3. Commit row to the catalog registry
  const result = await prisma.course.create({
    data: {
      code: payload.code.toUpperCase().trim(),
      title: payload.title,
      credits: payload.credits,
      description: payload.description,
      departmentId: payload.departmentId,
    },
  });

  return result;
};

/**
 * Fetch All Courses with dynamic searching, pagination, and sorting parameters
 */
const getAllCourses = async (query: IQuery & ICourseFilterRequest) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy && query.sortBy !== "createdAt" ? (query.sortBy as string) : "title";
  const sortOrder = query.sortOrder ? (query.sortOrder as string) : "asc";

  const andConditions: Prisma.CourseWhereInput[] = [];

  // Multi-field partial string searching
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { title: { contains: query.searchTerm, mode: "insensitive" } },
        { code: { contains: query.searchTerm, mode: "insensitive" } },
      ],
    });
  }

  // Relational parent structural filtering
  if (query.departmentId) {
    andConditions.push({ departmentId: query.departmentId });
  }

  const whereConditions: Prisma.CourseWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const courses = await prisma.course.findMany({
    where: whereConditions,
    take: limit,
    skip,
    orderBy: { [sortBy]: sortOrder },
    include: {
      department: {
        select: { id: true, name: true, code: true },
      },
    },
  });

  const total = await prisma.course.count({ where: whereConditions });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: courses,
  };
};

/**
 * Get details of a single unique course by its ID
 */
const getSingleCourse = async (id: string): Promise<Course> => {
  const course = await prisma.course.findUnique({
    where: { id },
    include: { department: true },
  });

  if (!course) {
    throw new AppError(httpStatus.NOT_FOUND, "Requested course record not found.");
  }

  return course;
};

/**
 * Patch update configurations on an existing Course
 */
const updateCourse = async (id: string, payload: Partial<ICourseCreatePayload>): Promise<Course> => {
  await getSingleCourse(id); // Throws 404 error cleanly if missing

  if (payload.code) {
    const duplicateCode = await prisma.course.findFirst({
      where: {
        code: payload.code.toUpperCase().trim(),
        NOT: { id },
      },
    });
    if (duplicateCode) {
      throw new AppError(httpStatus.CONFLICT, "Another course is already registered with this code.");
    }
  }

  const result = await prisma.course.update({
    where: { id },
    data: {
      ...payload,
      code: payload.code ? payload.code.toUpperCase().trim() : undefined,
    },
  });

  return result;
};

/**
 * Permanently delete a course from your registry mapping entries
 */
const deleteCourse = async (id: string): Promise<Course> => {
  await getSingleCourse(id);

  const result = await prisma.course.delete({
    where: { id },
  });

  return result;
};

export const CourseService = {
  createCourse,
  getAllCourses,
  getSingleCourse,
  updateCourse,
  deleteCourse,
};
