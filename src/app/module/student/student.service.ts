import { UploadApiResponse } from "cloudinary";
import { FeeStatus, Prisma, Student } from "../../../generated/prisma/client";
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

	// 4. Execute atomic updates and automatic semester provisioning using transaction block
	const updatedStudent = await prisma.$transaction(async (tx) => {
		// Update student profile metadata columns
		const studentRecord = await tx.student.update({
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

		const finalDeptId = departmentId || student.departmentId;
		const finalProgId = programId || student.programId;

		// 🚀 AUTOMATIC SEEDING LOGIC: Runs only if the student has a valid department & program
		if (finalDeptId && finalProgId) {
			// Find the active semester where registration is currently open
			const activeSemester = await tx.semester.findFirst({
				where: { registrationOpen: true }
			});

			// If no semester is actively open, skip or throw depending on choice. We skip safely here.
			if (activeSemester) {
				// Prevent duplicate invoicing: Check if this student already has a fee record for this semester
				const existingFee = await tx.studentFee.findFirst({
					where: {
						studentId: studentRecord.id,
						semesterId: activeSemester.id
					}
				});

				if (!existingFee) {
					const defaultTuitionAmount = 24500.00; // Standard base admission fee rate
					const uniqueInvoiceNumber = `INV-${activeSemester.code}-${studentRecord.studentId || Date.now()}`;
					const defaultDueDate = new Date();
					defaultDueDate.setDate(defaultDueDate.getDate() + 7); // Due exactly 7 days from now

					// Create the StudentFee record automatically linked to the discovered semester ID
					await tx.studentFee.create({
						data: {
							amount: new Prisma.Decimal(defaultTuitionAmount),
							dueDate: defaultDueDate,
							status: FeeStatus.UNPAID, // Maps to your schema FeeStatus enum properties
							description: `Admission and Tuition Fees for ${activeSemester.name}`,
							studentId: studentRecord.id,
							semesterId: activeSemester.id, // 🧠 Automatically handled behind the scenes!
							merchantInvoiceNumber: uniqueInvoiceNumber,
							payerReference: studentRecord.email,
							paymentGetway: "bkash",
							currency: "BDT"
						}
					});
				}
			}
		}

		return studentRecord;
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