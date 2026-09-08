import { InstructorVerificationStatus } from "../../../generated/prisma/enums";

export interface IInstructorPayload {
  id: string;
  userId: string;
  employeeId: string;
  designation: string;
  departmentId: string;
}

export interface IVerifyDoctorEmailPayload {
    email: string;
    otp: string;
}

export interface IApproveInstructorPayload {
    instructorId: string;
    verificationStatus: InstructorVerificationStatus;
}

export interface IUpdateInstructorProfilePayload {
    name: string
}