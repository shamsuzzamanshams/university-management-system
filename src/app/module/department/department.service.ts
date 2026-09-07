// import { Prisma, Department } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { IQuery } from "../../interfaces";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { Department, Prisma } from "../../../generated/prisma/client";


const createDepartment = async (data: Prisma.DepartmentCreateInput): Promise<Department> => {
  
  const existingDepartment = await prisma.department.findFirst({
    where: {
      OR: [
        { name: data.name },
        { code: data.code }
      ]
    }
  });

  if (existingDepartment) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Department with this name or code already exists"
    );
  }

  const result = await prisma.department.create({
    data,
  });
  return result;
};


const getAllDepartments = async (query: IQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  // 1. FORCE sorting to use 'name' or 'id' and completely ignore query.sortBy
  // const sortBy = query.sortBy && query.sortBy !== "createdAt" ? (query.sortBy as string) : "name"; 
  // const sortOrder = query.sortOrder ? (query.sortOrder as string) : "desc";

  const andConditions: Prisma.DepartmentWhereInput[] = [];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: query.searchTerm as string, mode: "insensitive" } },
        { code: { contains: query.searchTerm as string, mode: "insensitive" } },
      ],
    });
  }

  // const whereConditions: Prisma.DepartmentWhereInput =
  //   andConditions.length > 0 ? { AND: andConditions } : {};

  // 2. Fetch data safely
  const departments = await prisma.department.findMany({
    where: { AND: andConditions },
    take: limit,
    skip,
    // orderBy: { [sortBy]: sortOrder }, // <-- Safe now because "createdAt" is blocked above
    include: {
      programs: true,
      students: { select: { id: true } }, 
    },
  });

  const total = await prisma.department.count({
    where: { AND: andConditions },
  });

  return {
    data: departments,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    
  };
};


const getSingleDepartment = async (id: string): Promise<Department> => {
  const department = await prisma.department.findUnique({
    where: { id },
    include: {
      programs: true,
      instructors: true,
    },
  });

  if (!department) {
    throw new AppError(httpStatus.NOT_FOUND, "Department Not Found");
  }

  return department;
};


const updateDepartment = async (
  id: string,
  payload: Prisma.DepartmentUpdateInput
): Promise<Department> => {
 
  await getSingleDepartment(id);

  const result = await prisma.department.update({
    where: { id },
    data: payload,
  });
  return result;
};


const deleteDepartment = async (id: string): Promise<Department> => {
  await getSingleDepartment(id);

  const result = await prisma.department.delete({
    where: { id },
  });
  return result;
};

export const DepartmentService = {
  createDepartment,
  getAllDepartments,
  getSingleDepartment,
  updateDepartment,
  deleteDepartment,
};
