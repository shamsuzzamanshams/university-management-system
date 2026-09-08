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

const applyAsInstructor = async (payload: any) => {
  if (!payload?.user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User information is required",
    );
  }

  if (!payload?.instructor) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Instructor information is required",
    );
  }

  if (!payload.instructor.designation) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Instructor designation is required",
    );
  }

  if (!payload.instructor.departmentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Department is required",
    );
  }

  const isUserExists = await prisma.user.findUnique({
    where: {
      email: payload.user.email,
    },
  });

  if (isUserExists) {
    throw new AppError(
      httpStatus.CONFLICT,
      "User already exists with this email",
    );
  }

  // Generate OTP
  const otp = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();

  // Save application temporarily in Redis
  await redisClient.set(
    `instructor-application:${payload.user.email}`,
    JSON.stringify(payload),
    {
      EX: 300,
    },
  );

  // Save OTP separately
  await redisClient.set(
    `instructor-otp:${payload.user.email}`,
    otp,
    {
      EX: 300,
    },
  );

  // Send OTP
  await transpoter.sendMail({
    to: payload.user.email,
    subject: "Verify Your Instructor Application",
    html: `
      <h2>Instructor Application Verification</h2>
      <p>Your verification OTP is:</p>

      <h1>${otp}</h1>

      <p>This OTP will expire in 5 minutes.</p>
      <p>If you did not request this application, please ignore this email.</p>
    `,
  });

  return {
    email: payload.user.email,
    message: "OTP sent to your email",
  };
};


const verifyInstructorOtp = async (
  email: string,
  otp: string,
) => {
  const storedOtp = await redisClient.get(
    `instructor-otp:${email}`,
  );

  if (!storedOtp) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "OTP expired or not found",
    );
  }

  if (storedOtp !== otp) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid OTP",
    );
  }

  const applicationData = await redisClient.get(
    `instructor-application:${email}`,
  );

  if (!applicationData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Instructor application expired",
    );
  }

  const payload = JSON.parse(applicationData);

  const randomInstructorPassword = Math.random()
    .toString(36)
    .slice(-8);

  const hashedPassword = await bcrypt.hash(
    randomInstructorPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const instructorApplication =
    await prisma.user.create({
      data: {
        ...payload.user,
        password: hashedPassword,
        role: Role.INSTRUCTOR,

		emailVerified: true,

        instructor: {
          create: {
            designation:
              payload.instructor.designation,
            name: payload.user.name,
            email: payload.user.email,

            department: {
              connect: {
                id: payload.instructor.departmentId,
              },
            },
          },
        },
      },

      omit: {
        password: true,
      },
    });

  // Delete OTP/application after successful verification
  await redisClient.del(`instructor-otp:${email}`);
  await redisClient.del(`instructor-application:${email}`);

  return instructorApplication;
};


const approveInstructor = async (instructorId: string) => {
  if (!instructorId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Instructor ID is required",
    );
  }

  const instructor = await prisma.instructor.findUnique({
    where: {
      id: instructorId,
    },
    include: {
      user: true,
    },
  });

  if (!instructor) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Instructor not found",
    );
  }

  if (instructor.verificationStatus === "APPROVED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Instructor is already approved",
    );
  }

  const result = await prisma.instructor.update({
    where: {
      id: instructorId,
    },
    data: {
      verificationStatus: "APPROVED",
    },
    include: {
      user: {
        omit: {
          password: true,
        },
      },
    },
  });

  return result;
};

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
    verifyInstructorOtp,
    approveInstructor,
    getAllInstructor,
    updateInstructorProfile
}