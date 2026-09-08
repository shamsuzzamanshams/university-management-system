import { prisma } from "../../lib/prisma";
import { RequstUser } from "../../middleware/checkAuth";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import config from "../../config";

import {
	ICreateSemesterPayload,
	IUpdateSemesterPayload,
	IInitializeRegistrationPayload,
	IPayRegistrationPayload,
} from "./semester.interface";

import { getBkashToken } from "../../lib/bkash";

import { FeeStatus } from "../../../generated/prisma/enums";
import { Prisma } from "../../../generated/prisma/client";

import { transpoter } from "../../lib/nodemailer";

import PDFDocument from "pdfkit";


// =====================================================
// CREATE SEMESTER
// =====================================================

const createSemester = async (
	payload: ICreateSemesterPayload
) => {
	const code = payload.code.trim().toUpperCase();

	const existingSemester = await prisma.semester.findUnique({
		where: {
			code,
		},
	});

	if (existingSemester) {
		throw new AppError(
			httpStatus.CONFLICT,
			"Semester with this code already exists."
		);
	}

	const startDate = new Date(payload.startDate);
	const endDate = new Date(payload.endDate);

	if (startDate >= endDate) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"End date must be greater than start date."
		);
	}

	const semester = await prisma.semester.create({
		data: {
			name: payload.name.trim(),
			code,
			startDate,
			endDate,
			registrationOpen: payload.registrationOpen ?? false,
		},
	});

	return semester;
};


// =====================================================
// GET ALL SEMESTERS
// =====================================================

const getAllSemesters = async () => {
	const semesters = await prisma.semester.findMany({
		orderBy: {
			startDate: "desc",
		},

		include: {
			enrollments: true,
			studentFees: true,
		},
	});

	return semesters;
};


// =====================================================
// GET SINGLE SEMESTER
// =====================================================

const getSingleSemester = async (
	semesterId: string
) => {
	const semester = await prisma.semester.findUnique({
		where: {
			id: semesterId,
		},

		include: {
			enrollments: true,
			studentFees: true,
		},
	});

	if (!semester) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"Semester not found."
		);
	}

	return semester;
};


// =====================================================
// UPDATE SEMESTER
// =====================================================

const updateSemester = async (
	semesterId: string,
	payload: IUpdateSemesterPayload
) => {
	const existingSemester = await prisma.semester.findUnique({
		where: {
			id: semesterId,
		},
	});

	if (!existingSemester) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"Semester not found."
		);
	}

	let code = existingSemester.code;

	if (payload.code) {
		code = payload.code.trim().toUpperCase();

		const duplicateSemester = await prisma.semester.findFirst({
			where: {
				code,
				NOT: {
					id: semesterId,
				},
			},
		});

		if (duplicateSemester) {
			throw new AppError(
				httpStatus.CONFLICT,
				"Another semester with this code already exists."
			);
		}
	}

	const startDate = payload.startDate
		? new Date(payload.startDate)
		: existingSemester.startDate;

	const endDate = payload.endDate
		? new Date(payload.endDate)
		: existingSemester.endDate;

	if (startDate >= endDate) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"End date must be greater than start date."
		);
	}

	const semester = await prisma.semester.update({
		where: {
			id: semesterId,
		},

		data: {
			name: payload.name?.trim(),
			code,
			startDate,
			endDate,
			registrationOpen: payload.registrationOpen,
		},
	});

	return semester;
};


// =====================================================
// DELETE SEMESTER
// =====================================================

const deleteSemester = async (
	semesterId: string
) => {
	const existingSemester = await prisma.semester.findUnique({
		where: {
			id: semesterId,
		},
	});

	if (!existingSemester) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"Semester not found."
		);
	}

	const semester = await prisma.semester.delete({
		where: {
			id: semesterId,
		},
	});

	return semester;
};


// =====================================================
// INITIATE SEMESTER REGISTRATION PAYMENT
// =====================================================

const initiateSemesterRegistration = async (
	payload: IInitializeRegistrationPayload,
	user: RequstUser
) => {
	const {
		semesterId,
		amount,
		description,
	} = payload;

	if (!semesterId) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Semester ID is required."
		);
	}

	const result = await prisma.$transaction(async (tx) => {

		// Find logged-in student's profile
		const student = await tx.student.findUnique({
			where: {
				userId: user.userId,
			},
		});

		if (!student) {
			throw new AppError(
				httpStatus.NOT_FOUND,
				"Student profile not found."
			);
		}

		// Find semester
		const semester = await tx.semester.findUnique({
			where: {
				id: semesterId,
			},
		});

		if (!semester) {
			throw new AppError(
				httpStatus.NOT_FOUND,
				"Semester not found."
			);
		}

		// Check registration
		if (!semester.registrationOpen) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Semester registration is currently closed."
			);
		}

		// Check existing fee
		const existingFee = await tx.studentFee.findFirst({
			where: {
				studentId: student.id,
				semesterId,
			},
		});

		if (existingFee?.status === FeeStatus.PAID) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"You Have Already Paid Your Fees For This Semester."
			);
		}

		if (existingFee?.status === FeeStatus.UNPAID) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"You Already Have An Unpaid Invoice. Please complete payment using the Retry endpoint."
			);
		}

		// Create invoice
		const merchantInvoiceNumber =
			`SEM-${semester.code}-${Date.now()}`;

		const dueDate = new Date();

		dueDate.setDate(
			dueDate.getDate() + 7
		);

		const studentFee = await tx.studentFee.create({
			data: {
				studentId: student.id,
				semesterId,

				amount: new Prisma.Decimal(amount),

				status: FeeStatus.UNPAID,

				dueDate,

				description,

				merchantInvoiceNumber,

				payerReference: user.email,

				paymentGetway: "bkash",

				currency: "BDT",
			},
		});

		// Get bKash token
		const token = await getBkashToken();

		if (!token) {
			throw new AppError(
				httpStatus.BAD_GATEWAY,
				"No bkash access token found!"
			);
		}

		// Create bKash payment
		const paymentResponse = await fetch(
			`${config.bkash_base_url}/tokenized/checkout/create`,
			{
				method: "POST",

				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					authorization: token,
					"x-app-key": config.bkash_app_key!,
				},

				body: JSON.stringify({
					mode: "0011",

					payerReference: user.email,

					callbackURL:
						`${config.bkash_callback_url}/semester/payment/callback`,

					amount: amount.toString(),

					currency: "BDT",

					intent: "sale",

					merchantInvoiceNumber,
				}),
			}
		);

		const paymentResult =
			await paymentResponse.json();

		if (
			!paymentResponse.ok ||
			!paymentResult?.bkashURL
		) {
			throw new AppError(
				httpStatus.BAD_GATEWAY,
				"Unable to create bKash payment."
			);
		}

		// Save bKash payment ID
		await tx.studentFee.update({
			where: {
				id: studentFee.id,
			},

			data: {
				bkashPaymentId:
					paymentResult.paymentID,
			},
		});

		return {
			feeId: studentFee.id,

			paymentId:
				paymentResult.paymentID,

			paymentUrl:
				paymentResult.bkashURL,
		};
	});

	return result;
};


// =====================================================
// RETRY PAYMENT
// =====================================================

const paySemesterRegistrationFee = async (
	payload: IPayRegistrationPayload,
	user: RequstUser
) => {
	const { feeId } = payload;

	const existingFee =
		await prisma.studentFee.findUnique({
			where: {
				id: feeId,
			},

			include: {
				student: true,
				semester: true,
			},
		});

	if (!existingFee) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"Student fee invoice not found."
		);
	}

	// Security check
	if (
		existingFee.student.userId !== user.userId
	) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not allowed to pay this invoice."
		);
	}

	if (
		existingFee.status === FeeStatus.PAID
	) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"This invoice has already been paid."
		);
	}

	const token = await getBkashToken();

	if (!token) {
		throw new AppError(
			httpStatus.BAD_GATEWAY,
			"No bkash access token found!"
		);
	}

	const paymentResponse = await fetch(
		`${config.bkash_base_url}/tokenized/checkout/create`,
		{
			method: "POST",

			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				authorization: token,
				"x-app-key": config.bkash_app_key!,
			},

			body: JSON.stringify({
				mode: "0011",

				payerReference: user.email,

				callbackURL:
					`${config.bkash_callback_url}/semester/payment/callback`,

				amount:
					existingFee.amount.toString(),

				currency: "BDT",

				intent: "sale",

				merchantInvoiceNumber:
					existingFee.merchantInvoiceNumber,
			}),
		}
	);

	const paymentResult =
		await paymentResponse.json();

	if (
		!paymentResponse.ok ||
		!paymentResult?.bkashURL
	) {
		throw new AppError(
			httpStatus.BAD_GATEWAY,
			"Unable to regenerate bKash payment."
		);
	}

	await prisma.studentFee.update({
		where: {
			id: feeId,
		},

		data: {
			bkashPaymentId:
				paymentResult.paymentID,
		},
	});

	return {
		feeId,

		paymentId:
			paymentResult.paymentID,

		paymentUrl:
			paymentResult.bkashURL,
	};
};




const bookSemesterPaymentCallback = async (
	query: Record<string, any>
) => {
	const transactionResult = await prisma.$transaction(
		async (tx) => {
			const paymentId = query.paymentID;

			if (!paymentId) {
				throw new AppError(
					httpStatus.BAD_REQUEST,
					"Payment is missing"
				);
			}

			const status = query.status;

			if (!status) {
				throw new AppError(
					httpStatus.BAD_REQUEST,
					"Payment Status is missing"
				);
			}

			// =================================================
			// GET BKASH TOKEN
			// =================================================

			const bkashIdToken = await getBkashToken();

			if (!bkashIdToken) {
				throw new AppError(
					httpStatus.BAD_GATEWAY,
					"No bkash access token found!"
				);
			}

			// =================================================
			// EXECUTE BKASH PAYMENT
			// =================================================

			const executedPaymentResponse = await fetch(
				`${config.bkash_base_url}/tokenized/checkout/execute`,
				{
					method: "POST",

					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
						Authorization: bkashIdToken,
						"X-App-Key": config.bkash_app_key!,
					},

					body: JSON.stringify({
						paymentID: paymentId,
					}),
				}
			);

			const executedPaymentResult =
				await executedPaymentResponse.json();

			// =================================================
			// PAYMENT SUCCESS
			// =================================================

			if (
				status === "success" &&
				executedPaymentResponse.ok &&
				executedPaymentResult?.statusCode === "0000"
			) {
				// -----------------------------------------------
				// FIND STUDENT FEE
				// -----------------------------------------------

				const studentFee =
					await tx.studentFee.findFirst({
						where: {
							merchantInvoiceNumber:
								executedPaymentResult.merchantInvoiceNumber,
						},

						include: {
							student: {
								include: {
									department: true,
									program: true,
								},
							},

							semester: true,
						},
					});

				if (!studentFee) {
					throw new AppError(
						httpStatus.NOT_FOUND,
						"Student fee invoice not found."
					);
				}

				// -----------------------------------------------
				// PREVENT DUPLICATE PAYMENT PROCESSING
				// -----------------------------------------------

				if (studentFee.status === FeeStatus.PAID) {
					return {
						redirectUrl:
							`${config.frontend_url}/dashboard/semester?status=success`,
					};
				}

				// -----------------------------------------------
				// UPDATE FEE AS PAID
				// -----------------------------------------------

				const paidFee = await tx.studentFee.update({
					where: {
						id: studentFee.id,
					},
					data: {
						status: FeeStatus.PAID,
						bkashTrxId: executedPaymentResult.trxID,
						paidAt: new Date(),
					},
					include: {
						student: {
							include: {
								department: true,
								program: true,
							},
						},
						semester: true,
					},
				});

				// =================================================
				// GENERATE PDF RECEIPT
				// =================================================

				const pdfBuffer =
					await new Promise<Buffer>(
						(resolve, reject) => {
							const pdfDocument =
								new PDFDocument({
									size: "A4",
									margin: 50,
								});

							const pdfChunks: Buffer[] = [];

							// -----------------------------------------
							// PDF DATA
							// -----------------------------------------

							pdfDocument.on(
								"data",
								(chunk: Buffer) => {
									pdfChunks.push(chunk);
								}
							);

							// -----------------------------------------
							// PDF COMPLETE
							// -----------------------------------------

							pdfDocument.on(
								"end",
								() => {
									resolve(
										Buffer.concat(pdfChunks)
									);
								}
							);

							// -----------------------------------------
							// PDF ERROR
							// -----------------------------------------

							pdfDocument.on(
								"error",
								(error) => {
									reject(error);
								}
							);

							// =========================================
							// HEADER
							// =========================================

							pdfDocument
								.fontSize(20)
								.font("Helvetica-Bold")
								.text(
									"UNIVERSITY MANAGEMENT SYSTEM",
									{
										align: "center",
									}
								);

							pdfDocument
								.moveDown(0.5)
								.fontSize(15)
								.font("Helvetica-Bold")
								.text(
									"Semester Registration Payment Receipt",
									{
										align: "center",
									}
								);

							pdfDocument.moveDown(1);

							pdfDocument
								.fontSize(10)
								.font("Helvetica")
								.text(
									"================================================",
									{
										align: "center",
									}
								);

							pdfDocument.moveDown(1.5);

							// =========================================
							// PAYMENT SUCCESS
							// =========================================

							pdfDocument
								.fontSize(16)
								.font("Helvetica-Bold")
								.text(
									"PAYMENT SUCCESSFUL",
									{
										align: "center",
									}
								);

							pdfDocument.moveDown(2);

							// =========================================
							// STUDENT INFORMATION
							// =========================================

							pdfDocument
								.fontSize(14)
								.font("Helvetica-Bold")
								.text(
									"Student Information"
								);

							pdfDocument.moveDown(0.5);

							pdfDocument
								.fontSize(11)
								.font("Helvetica")
								.text(
									`Student Name : ${paidFee.student.name}`
								)
								.text(
									`Student ID   : ${paidFee.student.studentId}`
								)
								.text(
									`Email        : ${paidFee.student.email}`
								)
								.text(
									`Department   : ${paidFee.student.department?.name ??
									"N/A"
									}`
								)
								.text(
									`Program      : ${paidFee.student.program?.name ??
									"N/A"
									}`
								);

							pdfDocument.moveDown(1.5);

							// =========================================
							// SEMESTER INFORMATION
							// =========================================

							pdfDocument
								.fontSize(14)
								.font("Helvetica-Bold")
								.text(
									"Semester Information"
								);

							pdfDocument.moveDown(0.5);

							pdfDocument
								.fontSize(11)
								.font("Helvetica")
								.text(
									`Semester Name : ${paidFee.semester.name}`
								)
								.text(
									`Semester Code : ${paidFee.semester.code}`
								)
								.text(
									`Start Date    : ${paidFee.semester.startDate.toDateString()}`
								)
								.text(
									`End Date      : ${paidFee.semester.endDate.toDateString()}`
								);

							pdfDocument.moveDown(1.5);

							// =========================================
							// PAYMENT INFORMATION
							// =========================================

							pdfDocument
								.fontSize(14)
								.font("Helvetica-Bold")
								.text(
									"Payment Information"
								);

							pdfDocument.moveDown(0.5);

							pdfDocument
								.fontSize(11)
								.font("Helvetica")
								.text(
									`Amount Paid      : BDT ${paidFee.amount.toString()}`
								)
								.text(
									`Payment Method   : bKash`
								)
								.text(
									`Transaction ID   : ${paidFee.bkashTrxId ?? "N/A"
									}`
								)
								.text(
									`Invoice Number   : ${paidFee.merchantInvoiceNumber}`
								)
								.text(
									`Payment Date     : ${paidFee.paidAt
										? paidFee.paidAt.toLocaleString()
										: new Date().toLocaleString()
									}`
								)
								.text(
									`Payment Status   : PAID`
								);

							pdfDocument.moveDown(2);

							// =========================================
							// FOOTER
							// =========================================

							pdfDocument
								.fontSize(10)
								.font("Helvetica")
								.text(
									"This is an electronically generated payment receipt.",
									{
										align: "center",
									}
								);

							pdfDocument
								.moveDown(0.5)
								.text(
									"Thank you for completing your semester registration.",
									{
										align: "center",
									}
								);

							pdfDocument.moveDown(2);

							pdfDocument
								.fontSize(9)
								.text(
									"University Management System",
									{
										align: "center",
									}
								);

							// -----------------------------------------
							// FINISH PDF
							// -----------------------------------------

							pdfDocument.end();
						}
					);

				// =================================================
				// SEND PDF RECEIPT TO STUDENT EMAIL
				// =================================================

				try {
					await transpoter.sendMail({
						from: config.email_sender,

						to: paidFee.student.email,

						subject:
							"Semester Registration Payment Receipt - University Management System",

						text: `
Dear ${paidFee.student.name},

Your semester registration payment has been completed successfully.

Semester: ${paidFee.semester.name}
Semester Code: ${paidFee.semester.code}
Amount Paid: BDT ${paidFee.amount.toString()}
Transaction ID: ${paidFee.bkashTrxId}
Invoice Number: ${paidFee.merchantInvoiceNumber}

Please find your official payment receipt attached to this email.

Thank you for completing your semester registration.

University Management System
            `,

						html: `
              <div
                style="
                  font-family: Arial, sans-serif;
                  max-width: 600px;
                  margin: auto;
                  padding: 20px;
                "
              >

                <h2>
                  Semester Registration Payment Successful
                </h2>

                <p>
                  Dear
                  <strong>
                    ${paidFee.student.name}
                  </strong>,
                </p>

                <p>
                  Your semester registration payment has been
                  successfully completed.
                </p>

                <hr />

                <p>
                  <strong>Semester:</strong>
                  ${paidFee.semester.name}
                </p>

                <p>
                  <strong>Semester Code:</strong>
                  ${paidFee.semester.code}
                </p>

                <p>
                  <strong>Amount Paid:</strong>
                  BDT ${paidFee.amount.toString()}
                </p>

                <p>
                  <strong>Transaction ID:</strong>
                  ${paidFee.bkashTrxId}
                </p>

                <p>
                  <strong>Invoice Number:</strong>
                  ${paidFee.merchantInvoiceNumber}
                </p>

                <p>
                  <strong>Payment Status:</strong>
                  PAID
                </p>

                <hr />

                <p>
                  Your official payment receipt is attached
                  to this email as a PDF.
                </p>

                <p>
                  Thank you for completing your
                  semester registration.
                </p>

                <br />

                <strong>
                  University Management System
                </strong>

              </div>
            `,

						attachments: [
							{
								filename:
									`semester-payment-receipt-${paidFee.student.studentId}.pdf`,

								content: pdfBuffer,

								contentType: "application/pdf",
							},
						],
					});

					console.log(
						`Payment receipt sent successfully to ${paidFee.student.email}`
					);
				} catch (error) {
					// Payment is already successful.
					// Email failure should not change payment status.

					console.error(
						"Failed to send payment receipt email:",
						error
					);
				}

				// ================================================
				// SUCCESS REDIRECT
				// ================================================

				return {
					redirectUrl:
						`${config.frontend_url}/dashboard/semester?status=success`,
				};
			}

			// =================================================
			// PAYMENT FAILURE
			// =================================================

			if (status === "failure") {
				await tx.studentFee.updateMany({
					where: {
						bkashPaymentId: paymentId,
					},

					data: {
						status: FeeStatus.FAILED,

						getwayResponse:
							executedPaymentResult,
					},
				});

				return {
					redirectUrl:
						`${config.frontend_url}/dashboard/semester?status=failure`,
				};
			}

			// =================================================
			// PAYMENT CANCELLED
			// =================================================

			if (status === "cancel") {
				await tx.studentFee.updateMany({
					where: {
						bkashPaymentId: paymentId,
					},

					data: {
						status: FeeStatus.CANCELLED,

						getwayResponse:
							executedPaymentResult,
					},
				});

				return {
					redirectUrl:
						`${config.frontend_url}/dashboard/semester?status=cancelled`,
				};
			}

			// =================================================
			// UNKNOWN STATUS
			// =================================================

			return {
				executedPaymentResult,

				redirectUrl:
					`${config.frontend_url}/dashboard/semester?status=failed`,
			};
		},
		{
			maxWait: 10000,
			timeout: 30000,
		}
	);

	return transactionResult;
};


// =====================================================
// EXPORT
// =====================================================

export const SemesterService = {

	// Semester CRUD
	createSemester,
	getAllSemesters,
	getSingleSemester,
	updateSemester,
	deleteSemester,

	// Semester payment
	initiateSemesterRegistration,
	paySemesterRegistrationFee,
	bookSemesterPaymentCallback,
};