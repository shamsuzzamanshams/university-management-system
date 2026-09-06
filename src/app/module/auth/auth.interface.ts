// import type { Role } from "@prisma/client"; // Aligned with standard Prisma client import path

import { Role } from "../../../generated/prisma/enums";

export interface ILoginUserPayload {
	email: string;
	password: string;
}

// Updated: Renamed from IRegisterPatientPayload to IRegisterStudentPayload
// Aligned with the firstName, lastName, and structural Student relationship fields
export interface IRegisterStudentPayload {
	name: string;
	email: string;
	password: string;
	student: {
		studentId : string;      // e.g., "2026-0001"
		departmentId : string;   // UUID string linking to Department
		programId : string;      // UUID string linking to Program
	};
}

export interface IVerifyEmailPayload {
	email: string;
	otp: string;
}

// Updated: Modified name layout to mirror the schema's split structural keys
export interface IRequestUser {
	userId: string;
	email: string;
	name: string; // Combined firstName and lastName passed from validation/auth tokens
	role: Role;
}

export interface IGoogleLoginPayload {
	idToken: string;
}

export interface IForgotPasswordPayload {
	email: string;
}

export interface IResetPasswordPayload {
	email: string;
	newPassword: string;
	otp: string;
}
