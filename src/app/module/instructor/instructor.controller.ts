import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { applyAsInstructorSchema } from "./instructor.validation";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { instructorSevice } from "./instructor.service";
import { sendResponse } from "../../utils/sendResponse";

const applyAsInstructor = catchAsync(async (req, res) => {
  console.log("BODY:", req.body);
  console.log("FILES:", req.files);

  const payload = req.body;

  const validatedData = applyAsInstructorSchema.parse(payload);

  const result = await instructorSevice.applyAsInstructor(
    validatedData,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Instructor application submitted successfully",
    data: result,
  });
});

const verifyInstructorOtp = catchAsync(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Email and OTP are required",
    );
  }

  const result = await instructorSevice.verifyInstructorOtp(
    email,
    otp,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Instructor application verified successfully",
    data: result,
  });
});

const approveInstructor = catchAsync(async (req, res) => {
  const { instructorId } = req.body;

  console.log("BODY:", req.body);
  console.log("INSTRUCTOR ID:", instructorId);

  if (!instructorId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Instructor ID is required",
    );
  }

  const result =
    await instructorSevice.approveInstructor(instructorId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Instructor approved successfully",
    data: result,
  });
});


const updateInstructorProfile = catchAsync(
	async (req: Request, res: Response) => {
		const payload = req.body;
		const user = req.user!;

		const result = await instructorSevice.updateInstructorProfile(payload, user);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Instructor Profile Updated Successfully",
			data: result,
		});
	},
);

export const instructorController = {
    applyAsInstructor,
    verifyInstructorOtp,
    approveInstructor,
    // getAllInstructor,
    updateInstructorProfile
}
