// import { Prisma, Program } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { IQuery } from "../../interfaces";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { Prisma, Program } from "../../../generated/prisma/client";


const createProgram = async (data: Prisma.ProgramCreateInput): Promise<Program> => {

  const existingProgram = await prisma.program.findFirst({
    where: {
      OR: [
        { name: data.name },
        { code: data.code }
      ]
    }
  });

  if (existingProgram) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "An academic program with this name or code already exists."
    );
  }

  const result = await prisma.program.create({
    data,
  });
  return result;
};


const getAllPrograms = async (query: IQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
//   const sortBy = query.sortBy ? (query.sortBy as string) : "createdAt";
//   const sortOrder = query.sortOrder ? (query.sortOrder as string) : "desc";

  const andConditions: Prisma.ProgramWhereInput[] = [];

  
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: query.searchTerm as string, mode: "insensitive" } },
        { code: { contains: query.searchTerm as string, mode: "insensitive" } },
      ],
    });
  }

  
  if (query.departmentId) {
    andConditions.push({ departmentId: query.departmentId as string });
  }

//   const whereConditions: Prisma.ProgramWhereInput =
//     andConditions.length > 0 ? { AND: andConditions } : {};

  const programs = await prisma.program.findMany({
    where: {AND: andConditions},
    take: limit,
    skip,
    // orderBy: { [sortBy]: sortOrder },
    include: {
      department: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      
      _count: {
        select: { students: true },
      },
    },
  });

  const total = await prisma.program.count({
    where: {AND: andConditions},
  });

  return {
    data: programs,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    
  };
};





const getSingleProgram = async (id: string): Promise<Program> => {
  const program = await prisma.program.findUnique({
    where: { id },
    include: {
      department: true,
    },
  });

  if (!program) {
    throw new AppError(httpStatus.NOT_FOUND, "Requested Academic Program Not Found");
  }

  return program;
};


const updateProgram = async (
  id: string,
  payload: Prisma.ProgramUpdateInput
): Promise<Program> => {
  
  await getSingleProgram(id);

  const result = await prisma.program.update({
    where: { id },
    data: payload,
  });
  return result;
};


const deleteProgram = async (id: string): Promise<Program> => {
  await getSingleProgram(id);

  const result = await prisma.program.delete({
    where: { id },
  });
  return result;
};

export const ProgramService = {
  createProgram,
  getAllPrograms,
  getSingleProgram,
  updateProgram,
  deleteProgram,
};
