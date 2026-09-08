import { UploadApiResponse } from "cloudinary";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import httpStatus from "http-status"
import { cloudinary } from "../../lib/cloudinary";
import bcrypt from "bcryptjs";
import config from "../../config";
import { InstructorVerificationStatus, Role } from "../../../generated/prisma/enums";
import { IApproveInstructorPayload, IInstructorPayload, IUpdateInstructorProfilePayload, IVerifyDoctorEmailPayload } from "./instructor.interface";
import { redisClient } from "../../lib/redis";
import { RequstUser } from "../../middleware/checkAuth";
import path from "path";
import ejs from "ejs";
import { transpoter } from "../../lib/nodemailer";
import { IQuery } from "../../interfaces";
import { Prisma } from "../../../generated/prisma/client";

const applyAsInstructor = async (
	payload: any,
	resume: Express.Multer.File | null,
	additionalFiles: Express.Multer.File[],
) => {
	const isUserExists = await prisma.user.findUnique({
		where: {
			email: payload.user.email,
		},
	});
	if (isUserExists) {
		throw new AppError(httpStatus.CONFLICT, "User already exist with this email");
	}

	const resumeUploadResult = await new Promise<UploadApiResponse>(
		(resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						resource_type: "auto",
					},
					async (error, result) => {
						if (error) {
							return reject(error);
						}

					if (!result) {
						return reject(new AppError(httpStatus.BAD_GATEWAY, "No result return from cloudinary"));
					}

						resolve(result);
						console.log(result, "result");
					},
				)
				.end(resume?.buffer);
		},
	);
	const additionalFilesUploadResults = await Promise.all(
		additionalFiles.map((file) => {
			return new Promise<UploadApiResponse>((resolve, reject) => {
				cloudinary.uploader
					.upload_stream(
						{
							resource_type: "auto",
						},

						async (error, result) => {
							if (error) {
								return reject(error);
							}

						if (!result) {
							return reject(new AppError(httpStatus.BAD_GATEWAY, "No result returned from Cloudinary"));
						}

							resolve(result);
						},
					)
					.end(file.buffer);
			});
		}),
	);

	const randomDoctorPassword = Math.random().toString(36).slice(-8);

	const hashedPassword = await bcrypt.hash(
		randomDoctorPassword,
		Number(config.bcrypt_salt_rounds),
	);
	const doctorApplication = await prisma.user.create({
		data: {
			...payload.user,
			password: hashedPassword,
			role: Role.INSTRUCTOR,
			needPasswordChange: true,
			doctor: {
				create: {
					name: payload.user.name,
					email: payload.user.email,
					...payload.doctor,
					resume: resumeUploadResult.secure_url,
					resumePublicId: resumeUploadResult.public_id,
					additionalFiles: additionalFilesUploadResults.map((file) => ({
						url: file.secure_url,
						publicId: file.public_id,
					})),
				},
			},
		},
		include: {
			instructor: true
		},
	});
	return doctorApplication;
};

const verifyInstructorEmail = async (payload : IVerifyDoctorEmailPayload) => {
	const otp = payload.otp;
	const email = payload.email.trim().toLowerCase();

	const existingUser = await prisma.user.findUnique({
		where: { email, role: Role.INSTRUCTOR },
	});

	if (!existingUser) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"Teacher Application Not Found. Please Apply Again.",
		);
	}

	if (existingUser.emailVerified) {
		throw new AppError(httpStatus.CONFLICT, "Email Already Verified");
	}

	const otpKey = `Teacher-application-otp:${email}`;

	const redisOtp = await redisClient.get(otpKey);

	if (!redisOtp) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"OTP Expired. Your Application Window Has Closed, Please Apply Again.",
		);
	}

	if (redisOtp !== otp) {
		throw new AppError(httpStatus.BAD_REQUEST, "OTP Does Not Match");
	}

	await redisClient.del(otpKey);

	const verifiedUser = await prisma.user.update({
		where: { id: existingUser.id },
		data: { emailVerified: true },
		omit: { password: true },
		include: { instructor: true },
	});

	return verifiedUser

};

const approveInstructor = async (payload : IApproveInstructorPayload, reviewer : RequstUser) => {
	const { instructorId, verificationStatus } = payload;

	const existingInstructor = await prisma.instructor.findUnique({
		where: { id: instructorId },
		include: { user: true },
	});

	if (!existingInstructor) {
		throw new AppError(httpStatus.NOT_FOUND, "Doctor Application Not Found");
	}


	if (!existingInstructor.user.emailVerified) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Doctor Has Not Verified Their Email Yet. Application Cannot Be Reviewed.",
		);
	}

	if (existingInstructor.verificationStatus !== InstructorVerificationStatus.PENDING) {
		throw new AppError(
			httpStatus.CONFLICT,
			`Doctor Application Has Already Been ${existingInstructor.verificationStatus.toLowerCase()}`,
		);
	}

	

	const updatedInstructor = await prisma.instructor.update({
		where: { id: instructorId },
		data: {
			verificationStatus,
			rejectionReason:
				verificationStatus === InstructorVerificationStatus.REJECTED,
					
			reviewedBy: reviewer.userId,
			reviewedAt: new Date(),
		},
	});

	const isApproved = verificationStatus === InstructorVerificationStatus.APPROVED;

	const tempatePath = path.join(
		process.cwd(),
		`src/app/templates/${isApproved
			? "instructor-application-approved.ejs"
			: "instructor-application-rejected.ejs"
		}`,
	);

	const templateData = {
		name: updatedInstructor.name,
	};


	const html = await ejs.renderFile(tempatePath, templateData);

	await transpoter.sendMail({
		from: config.email_sender,
		to: updatedInstructor.email,
		subject: isApproved
			? "Your Doctor Application Has Been Approved"
			: "Your Doctor Application Has Been Rejected",
		html,
	});

	return updatedInstructor



}

const getAllInstructor= async (query: IQuery) => {

	const limit = query.limit ? Number(query.limit) : 10;
	const page = query.page ? Number(query.page) : 1;
	const skip = (page - 1) * limit;
	const sortBy = query.sortBy ? query.sortBy : "createdAt";
	const sortOrder = query.sortOrder ? query.sortOrder : "desc"

	const andConditions: Prisma.InstructorWhereInput[] = []

	//Searching
	if (query.searchTerm) {
		andConditions.push({
			OR: [
				{ name: { contains: query.searchTerm, mode: "insensitive" } },
				{ email: { contains: query.searchTerm, mode: "insensitive" } },
			],
		});
	}

	//filtering

	if (query.email) {
		andConditions.push({
			email: { contains: query.email, mode: "insensitive" },
		});
	}

	if (query.verificationStatus) {
		andConditions.push({
			verificationStatus: query.verificationStatus as InstructorVerificationStatus,
		});
	}


	const allInstructors = await prisma.instructor.findMany({
		where : {
			AND : andConditions.length > 0 ? andConditions : undefined
		},

		take: limit,
		skip: skip,


		orderBy: {
			// sortBy : sortOrder
			[sortBy]: sortOrder
		},

		include:{
			user: {
				omit:{
					password: true
				}
			},

			// schedules: true,
			// appointments: true
			// prescriptions: true
		}

	});

	const totalInstructorCount = await prisma.instructor.count({
		where: {
			AND: andConditions
		}
	})

	return {
		data: allInstructors,
		meta: {
			page: page,
			limit: limit,
			total: totalInstructorCount,
			totalPages: Math.ceil(totalInstructorCount / limit)
		}
	}
}

const updateInstructorProfile = async (payload : IUpdateInstructorProfilePayload, user : RequstUser) => {
	const existingInstructor = await prisma.instructor.findUnique({
		where: { userId: user.userId },
	});

	if (!existingInstructor) {
		throw new AppError(httpStatus.NOT_FOUND, "Instructor Profile Not Found");
	}

	const updatedinstructor = await prisma.instructor.update({
		where: { id: existingInstructor.id },
		data: payload,
	});

	return updatedinstructor;

}

export const instructorSevice = {
    applyAsInstructor,
    verifyInstructorEmail,
    approveInstructor,
    getAllInstructor,
    updateInstructorProfile
}