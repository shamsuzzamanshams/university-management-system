import bcrypt from "bcryptjs";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
// import { Role } from "@prisma/client"; // Replace with your exact enum generation path if different
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import path from "path";
import type {
	IForgotPasswordPayload,
	IGoogleLoginPayload,
	ILoginUserPayload,
	IRegisterStudentPayload, // Updated interface reference name
	IRequestUser,
	IResetPasswordPayload,
	IVerifyEmailPayload,
} from "./auth.interface";
import { OAuth2Client, type TokenPayload } from "google-auth-library";
import { googleClient } from "../../lib/googleAuth";
import crypto from "crypto";
import { redisClient } from "../../lib/redis";
import { transpoter } from "../../lib/nodemailer";
import ejs from "ejs";
import { AuthProvider, Role } from "../../../generated/prisma/enums";
import { connect } from "http2";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";

// Renamed and Aligned to handle Student registration
const registerStudent = async (payload: IRegisterStudentPayload) => {
	const { name, password, student: studentData } = payload;
	const email = payload.email.trim().toLowerCase();

	const isUserExists = await prisma.user.findUnique({
		where: { email },
	});

	if (isUserExists) {
		throw new Error("User with this email already exists");
	}

	const hashedPassword = await bcrypt.hash(password, 8);

	const expirationSeconds = 5 * 60;
	const otpKey = `student-registration-otp:${email}`;
	const otpValue = crypto.randomInt(100000, 1000000).toString();
	await redisClient.set(otpKey, otpValue, {
		expiration: {
			type: "EX",
			value: expirationSeconds
		}
	});

	const studentRegistrationKey = `student-registration-data:${email}`;
	const redisUserDataPayload = {
		name,
		email,
		password: hashedPassword,
		student: studentData
	};

	await redisClient.set(studentRegistrationKey, JSON.stringify(redisUserDataPayload), {
		expiration: {
			type: "EX",
			value: expirationSeconds
		}
	});

	const templatePath = path.join(process.cwd(), "src/app/templates/registration-user-otp.ejs");

	const templateData = {
		name: `${name}`,
		email,
		otp: otpValue,
		expirationMinutes: expirationSeconds / 60
	};

	const html = await ejs.renderFile(templatePath, templateData);

	await transpoter.sendMail({
		from: config.email_sender,
		to: email,
		subject: "Email Verification",
		html
	});
};

// Renamed and Aligned to populate Student profile relation
const verifyStudentEmail = async (payload: IVerifyEmailPayload) => {
	const otp = payload.otp;
	const email = payload.email.trim().toLowerCase();

	const otpKey = `student-registration-otp:${email}`;
	const redisOtp = await redisClient.get(otpKey);

	if (!redisOtp) {
		throw new Error("Invalid OTP");
	}

	if (redisOtp !== otp) {
		throw new Error("OTP Does Not Match");
	}

	await redisClient.del(otpKey);

	const studentRegistrationKey = `student-registration-data:${email}`;
	const redisStudentData = await redisClient.get(studentRegistrationKey);

	if (!redisStudentData) {
		throw new Error("Student data does not exist or registration expired");
	}

	const studentPayload: IRegisterStudentPayload = JSON.parse(redisStudentData);

	const studentId = studentPayload?.student?.studentId || `STU-${Date.now()}`;
	const departmentId = studentPayload?.student?.departmentId || "";
	const programId = studentPayload?.student?.programId || "";
	const enrollmentDate = studentPayload?.student?.enrollmentDate
		? new Date(studentPayload.student.enrollmentDate)
		: new Date();

	// Safe transactional create mirroring the University Prisma configuration rules
	const createdUser = await prisma.user.create({
		data: {
			name: studentPayload.name,
			email: studentPayload.email,
			password: studentPayload.password,
			role: Role.STUDENT,
			isActive: true,
			emailVerified: true,
			authProvider: AuthProvider.CREDENTIAL,
			student: {
				create: {
					name: studentPayload.name,
					email: studentPayload.email,
					studentId: studentId, // Institutional ID e.g., "2026-0001"
					enrollmentDate: enrollmentDate,
					...(departmentId && {
						department: {
							connect: {
								id: departmentId
							}
						}
					}),
					...(programId && {
						program: {
							connect: {
								id: programId
							}
						}
					})
				},
			},
		},
		omit: { password: true },
		include: { student: true },
	});

	// Strip out the password block before returning
	// const {  ...userWithoutPassword } = createdUser;

	await redisClient.del(studentRegistrationKey);

	const templatePath = path.join(process.cwd(), "src/app/templates/student-welcome-email.ejs");
	const templateData = {
		name: createdUser.name
	};

	const html = await ejs.renderFile(templatePath, templateData);

	await transpoter.sendMail({
		from: config.email_sender,
		to: email,
		subject: "Welcome To University Management System",
		html
	});

	const { student, ...user } = createdUser;
	const jwtPayload = {
		userId: user.id,
		name: `${user.name}`,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		user,
		student,
		accessToken,
		refreshToken,
	};
};

const loginUser = async (payload: ILoginUserPayload) => {
	const { password } = payload;
	// const email = payload.email.trim().toLowerCase();

	const user = await prisma.user.findUnique({
		where: { email: payload.email },
	});

	if (!user) {
		throw new Error("User not found");
	}

	if (user.password === null && user.googleId !== null) {
		throw new AppError(
			httpStatus.CONFLICT,
			"User Already Has Account Registered With Google. Try To Login With Google",
		);
	}

	// 	 if (user.authProvider === "GOOGLE" || user.authProvider === AuthProvider.GOOGLE) {
	//     throw new Error("User account registered via social provider. Try to login with Google.");
	//   }

	if (!user.isActive) {
		throw new Error("User account is inactive");
	}

	if (user.password === null) {
		throw new Error(
			"User account registered via social provider. Try to login with Google.",
		);
	}

	const isPasswordMatched = await bcrypt.compare(
		password,
		user.password,
	);

	if (!isPasswordMatched) {
		throw new Error("Invalid credentials");
	}

	const jwtPayload = {
		userId: user.id,
		name: `${user.name}`,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};

const getMe = async (user: IRequestUser) => {
	const isUserExists = await prisma.user.findUnique({
		where: {
			id: user.userId,
		},
		include: {
			student: true,
			instructor: true,
		},
	});

	if (!isUserExists) {
		throw new Error("User not found");
	}

	const { password, ...userProfile } = isUserExists;
	return userProfile;
};

const refreshToken = async (token: string) => {
	const verifiedRefreshToken = jwtUtils.verifyToken(
		token,
		config.jwt_refresh_secret,
	);

	if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
		throw new Error(
			config.node_env === "development"
				? verifiedRefreshToken.error
				: "Invalid refresh token",
		);
	}

	const data = verifiedRefreshToken.data as JwtPayload;

	const user = await prisma.user.findUnique({
		where: { id: data.userId },
	});

	if (!user || !user.isActive) {
		throw new Error("User is inactive or not found");
	}

	const jwtPayload = {
		userId: user.id,
		name: `${user.name}`,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};

// Modified: Completely mapped, safe processing paths for Google Login flow tracking
const googleLogin = async (payload: IGoogleLoginPayload) => {
	let googleIdTokenPayload: TokenPayload | null | undefined = null;

	try {
		const ticket = await googleClient.verifyIdToken({
			idToken: payload.idToken,
			audience: config.google_clint_id,
		});

		googleIdTokenPayload = ticket.getPayload();
	} catch (error) {
		console.log("google id token verification faield", error);
		throw new Error("invalid or expired google id token");
	}

	if (!googleIdTokenPayload) {
		throw new Error("invalid or expired google id token");
	}

	if (!googleIdTokenPayload.email) {
		throw new Error("Google Email not found");
	}
	if (!googleIdTokenPayload.name) {
		throw new Error("Google User Name not found");
	}

	const ifStudentExistWithGoogleAuth = await prisma.user.findUnique({
		where: {
			email: googleIdTokenPayload.email,
			role: Role.STUDENT,
			googleId: googleIdTokenPayload.sub,
		},
	});

	let user = ifStudentExistWithGoogleAuth;

	if (!ifStudentExistWithGoogleAuth) {
		const ifStudentExistCredential = await prisma.user.findUnique({
			where: {
				email: googleIdTokenPayload.email,
				role: Role.STUDENT,
				authProvider: AuthProvider.CREDENTIAL,
			},
		});

		if (ifStudentExistCredential) {
			if (!ifStudentExistCredential.email) {
				throw new Error("Email Not Verified");
			}


			user = await prisma.user.update({
				where: {
					id: ifStudentExistCredential.id,
				},
				data: {
					googleId: googleIdTokenPayload.sub,
				},
			});
		} else {
			const customStudentId = payload.student?.studentId || `STU-${Date.now()}`;
			const departmentId = payload.student?.departmentId || "";
			const programId = payload.student?.programId || "";
			user = await prisma.user.create({
				data: {
					name: googleIdTokenPayload.name,
					email: googleIdTokenPayload.email,
					role: Role.STUDENT,
					googleId: googleIdTokenPayload.sub,
					authProvider: AuthProvider.GOOGLE,
					emailVerified: true,
					student: {
						create: {
							name: googleIdTokenPayload.name,
							email: googleIdTokenPayload.email,
							studentId: customStudentId,
							...(departmentId && {
								department: {
									connect: {
										id: departmentId
									}
								}
							}),
							...(programId && {
								program: {
									connect: {
										id: programId
									}
								}
							})


						},
					},
				},
				include: {
					student: true,
					instructor: true
				}
			});

			const templatePath = path.join(process.cwd(), "src/app/templates/student-welcome-email.ejs")

			const templateData = {
				name: user.name
			}

			const html = await ejs.renderFile(templatePath, templateData)



			await transpoter.sendMail({
				from: config.email_sender,
				to: user.email,
				subject: "Welcome To Healthcare System",
				// text: `Your OTP is ${otp}`
				html
			})
		}
	}

	if (!user) {
		throw new Error("User Not Found");
	}



	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};

const forgotPassword = async (payload: IForgotPasswordPayload) => {
	const { email } = payload;

	const isUserExist = await prisma.user.findUnique({
		where: {
			email
		}
	});

	if (!isUserExist) {
		throw new Error("User Does Not Exist!")
	}

	// Aligned with the field in your University schema (isActive: boolean)
	if (!isUserExist.isActive) {
		throw new Error("User is inactive or blocked")
	}

	// Checked if user registered passwordless via Google (passwordHash is null)
	if (isUserExist.password === null) {
		throw new Error("User Has Account Registered With Google. Try to login with Google.")
	}

	const otp = crypto.randomInt(100000, 1000000).toString();

	// Fixed typo in key name for cleaner Redis logs
	const key = `forgot-password-otp:${isUserExist.email}`;

	const expirationSeconds = 5 * 60;

	await redisClient.set(key, otp, {
		expiration: {
			type: "EX",
			value: expirationSeconds
		}
	});

	const templatePath = path.join(process.cwd(), "src/app/templates/forgot-password.ejs");

	const templateData = {
		// Aligned with name parameters (firstName + lastName) from your Prisma schema
		name: `${isUserExist.name}`,
		otp,
		expirationMinutes: expirationSeconds / 60
	};

	const html = await ejs.renderFile(templatePath, templateData);

	await transpoter.sendMail({
		from: config.email_sender,
		to: isUserExist.email,
		subject: "Forgot Password",
		html
	});
};

const resetPassword = async (payload: IResetPasswordPayload) => {
	const { email, otp, newPassword } = payload;

	const isUserExist = await prisma.user.findUnique({
		where: {
			email
		}
	});

	if (!isUserExist) {
		throw new Error("User Does Not Exist!")
	}

	// Aligned with the active schema field (isActive)
	if (!isUserExist.isActive) {
		throw new Error("User is inactive or blocked")
	}

	if (isUserExist.password === null) {
		throw new Error("User Has Account Registered With Google. Try to login with Google.")
	}

	const key = `forgot-password-otp:${isUserExist.email}`;

	const redisOtp = await redisClient.get(key);

	if (!redisOtp) {
		throw new Error("Invalid OTP");
	}

	if (redisOtp !== otp) {
		throw new Error("OTP Does Not Match");
	}

	const hashedNewPassword = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds || 8));

	// Updated fields to match your schema's 'passwordHash' designation
	await prisma.user.update({
		where: {
			email: isUserExist.email
		},
		data: {
			password: hashedNewPassword
		}
	});

	await redisClient.del(key);

	const templatePath = path.join(process.cwd(), "src/app/templates/reset-password-success.ejs");

	const html = await ejs.renderFile(templatePath, {
		name: `${isUserExist.name}`,
	});

	await transpoter.sendMail({
		from: config.email_sender,
		to: isUserExist.email,
		subject: "Password Change",
		html
	});
};

export const AuthService = {
	registerStudent,
	verifyStudentEmail,
	loginUser,
	getMe,
	refreshToken,
	googleLogin,
	forgotPassword,
	resetPassword
};
