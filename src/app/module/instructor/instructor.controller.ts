import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { ApplyAsInstructorValidationZodSchema } from "./instructor.validation";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { instructorSevice } from "./instructor.service";
import { sendResponse } from "../../utils/sendResponse";

const applyAsInstructor = catchAsync(async (req: Request, res: Response) => {
	const files = req.files as { [fieldname: string]: Express.Multer.File[] };
	console.log({ files });
	const resume = files?.["resume"] ? files["resume"][0] : null;
	const additionalFiles = files?.["additionalFiles"] || [];

	const zodValidationResult = ApplyAsInstructorValidationZodSchema.safeParse(
		JSON.parse(req.body.data),
	);

	if (!zodValidationResult.success) {
		throw new AppError(httpStatus.BAD_REQUEST, zodValidationResult.error.issues[0].message);
	}

	const payload = zodValidationResult.data;

	const result = await instructorSevice.applyAsInstructor(
		payload,
		resume,
		additionalFiles,
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Applied As Doctor Successfuly",
		data: result,
	});
});

const verifyInstructorEmail = catchAsync(async (req: Request, res: Response) => {
	
	const payload = req.body;

	const result = await instructorSevice.verifyInstructorEmail(payload)
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Instructor Email Verified Successfully",
		data: result,
	});
});

const approveInstructor = catchAsync(async (req: Request, res: Response) => {
	
	const payload = req.body;
	const user = req.user!

	const result = await instructorSevice.approveInstructor(payload, user)
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Instructor Email Verified Successfully",
		data: result,
	});
});

const getAllInstructor = catchAsync(async (req: Request, res: Response) => {
	

	const {data, meta} = await instructorSevice.getAllInstructor(req.query)
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Instructor Retrieved Successfully",
		data: data,
		meta : meta,
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
    verifyInstructorEmail,
    approveInstructor,
    getAllInstructor,
    updateInstructorProfile
}
