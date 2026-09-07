import { UploadApiResponse } from "cloudinary";
import { Prisma, Student } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { IUpdateStudentProfilePayload } from "./student.interface";
import httpStatus from "http-status";
import { cloudinary } from "../../lib/cloudinary";

const updateMyProfile = async (
	userId: string,
	payload: IUpdateStudentProfilePayload
): Promise<Student> => {
	const { departmentId, programId, ...profileData } = payload;

	// 1. Verify that the Student profile exists attached to this user account record
	const student = await prisma.student.findUnique({
		where: { userId },
	});

	if (!student) {
		throw new AppError(httpStatus.NOT_FOUND, "Student profile record not found.");
	}

	// 2. Validate structural changes if a new Department is being connected
	if (departmentId) {
		const departmentExists = await prisma.department.findUnique({
			where: { id: departmentId },
		});
		if (!departmentExists) {
			throw new AppError(httpStatus.NOT_FOUND, "The requested department does not exist.");
		}
	}

	// 3. Validate structural changes if a new academic Program is being connected
	if (programId) {
		const programExists = await prisma.program.findUnique({
			where: { id: programId },
		});
		if (!programExists) {
			throw new AppError(httpStatus.NOT_FOUND, "The requested academic program does not exist.");
		}
		
		// Integrity Guard: Ensure the selected program belongs strictly to the target department structure
		const targetDeptId = departmentId || student.departmentId;
		if (targetDeptId && programExists.departmentId !== targetDeptId) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"The selected program does not belong to the selected department structure.",
			);
		}
	}

	// 4. Update student record matching your exact domain mapping specifications
	const updatedStudent = await prisma.student.update({
		where: { id: student.id },
		data: {
			...profileData,
			...(departmentId && { departmentId }), 
			...(programId && { programId }),
		},
		include: {
			department: true,
			program: true,
		},
	});

	return updatedStudent;
};

const getMyProfile = async (userId: string): Promise<Student> => {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      department: true,
      program: true,
    },
  });

  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student profile record not found.");
  }

  return student;
};

export const StudentService = {
  updateMyProfile,
  getMyProfile,
};