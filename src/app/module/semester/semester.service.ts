// import { Prisma, FeeStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { RequstUser } from "../../middleware/checkAuth";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import config from "../../config";
import { ICreateSemesterPayload, IInitializeRegistrationPayload, IPayRegistrationPayload } from "./semester.interface";
import { getBkashToken } from "../../lib/bkash";
import { FeeStatus } from "../../../generated/prisma/enums";
import { Prisma } from "../../../generated/prisma/client";
import { transpoter } from "../../lib/nodemailer";
import  PDFDocument  from "pdfkit";



const createSemester = async (payload: ICreateSemesterPayload) => {
	const { name, code, startDate, endDate, registrationOpen } = payload;

	// 1. Guard against duplicate semester codes to prevent primary constraint database crashes
	const isSemesterCodeExists = await prisma.semester.findUnique({
		where: { code: code.toUpperCase().trim() },
	});

	if (isSemesterCodeExists) {
		throw new AppError(
			httpStatus.CONFLICT,
			`An academic semester record already exists with the code '${code}'.`
		);
	}

	// 2. Commit a fresh row mapping to the table tracking schema
	const newSemester = await prisma.semester.create({
		data: {
			name,
			code: code.toUpperCase().trim(),
			startDate: new Date(startDate),
			endDate: new Date(endDate),
			registrationOpen: registrationOpen || false, // Defaults safely to false if not passed
		},
	});

	return newSemester;
};
/**
 * 1. Initialize Semester Registration and Create a bKash Tokenized checkout redirect link
 */
const initiateSemesterRegistration = async (payload: IInitializeRegistrationPayload, user: RequstUser) => {
	const semesterId = payload?.semesterId;
	const studentId = payload?.studentId;
	const amount = payload?.amount;
	const description = payload?.description;

	// Early protective validation safeguards
	if (!semesterId) {
		throw new AppError(httpStatus.BAD_REQUEST, "Missing 'semesterId' in request body parameters.");
	}
	if (!studentId) {
		throw new AppError(httpStatus.BAD_REQUEST, "Missing 'studentId' in request body parameters.");
	}

	const transactionResult = await prisma.$transaction(async (tx) => {
		// 🚀 DYNAMIC LOOKUP: Works seamlessly whether they send a UUID or a "STU-" identifier code string!
		const student = await tx.student.findFirst({
			where: {
				OR: [
					{ id: studentId },        // Checks if it's the database entry UUID string
					{ studentId: studentId }  // Checks if it's the institutional "STU-..." text code
				]
			}
		});

		if (!student) {
			throw new AppError(httpStatus.NOT_FOUND, `Student Profile Not Found with identifier: ${studentId}`);
		}

		// Security Guard Clause
		if (student.userId !== user.userId) {
			throw new AppError(httpStatus.FORBIDDEN, "Unauthorized action. You can only register for your own account.");
		}

		// Verify target semester existence
		const verefySemester = await tx.semester.findUnique({
			where: { id: semesterId }, 
		});

		if (!verefySemester) {
			throw new AppError(httpStatus.NOT_FOUND, "Selected Semester Not Found");
		}

		if (!verefySemester.registrationOpen) {
			throw new AppError(httpStatus.BAD_REQUEST, "Registration Is Currently Closed For This Semester");
		}

		// Check for active historical payment blocks for this specific student and semester
		const existingFee = await tx.studentFee.findFirst({
			where: {
				studentId: student.id,
				semesterId: verefySemester.id
			},
		});

		if (existingFee?.status === FeeStatus.PAID) {
			throw new AppError(httpStatus.BAD_REQUEST, "You Have Already Paid Your Fees For This Semester.");
		}

		if (existingFee?.status === FeeStatus.UNPAID) {
			throw new AppError(
				httpStatus.BAD_REQUEST, 
				"You Already Have An Unpaid Invoice. Please complete payment using the Retry endpoint."
			);
		}

		const generatedInvoiceNumber = `INV-${verefySemester.code}-${Date.now()}`;
		const computedDueDate = new Date();
		computedDueDate.setDate(computedDueDate.getDate() + 7); // Due exactly 7 days from now

		// Create Student Fee billing record using strict decimal parsing rules
		const studentFee = await tx.studentFee.create({
			data: {
				amount: new Prisma.Decimal(amount),
				dueDate: computedDueDate,
				status: FeeStatus.UNPAID,
				description,
				studentId: student.id,
				semesterId: verefySemester.id,
				merchantInvoiceNumber: generatedInvoiceNumber,
				payerReference: user.email,
				paymentGetway: "bkash",
				currency: "BDT",
			},
		});

		// Fetch fresh token string from bKash server backend
		const bkashIdToken = await getBkashToken();
		if (!bkashIdToken) {
			throw new AppError(httpStatus.BAD_GATEWAY, "No bKash access token found!");
		}

		const bkashCreatePaymentResponse = await fetch(
			`${config.bkash_base_url}/tokenized/checkout/create`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					Authorization: bkashIdToken,
					"X-App-Key": config.bkash_app_key,
				},
				body: JSON.stringify({
					mode: "0011",
					payerReference: user.email,
					callbackURL: `${config.bkash_callback_url}/semester/payment/callback`,
					amount: amount.toString(),
					currency: "BDT",
					intent: "sale",
					merchantInvoiceNumber: studentFee.merchantInvoiceNumber, 
				}),
			},
		);

		const bkashCreatePaymentResult = await bkashCreatePaymentResponse.json();

		// Update invoice row tracking data parameters received from bKash response
		await tx.studentFee.update({
			where: { id: studentFee.id },
			data: {
				bkashPaymentId: bkashCreatePaymentResult.paymentID,
			},
		});

		return {
			paymentUrl: bkashCreatePaymentResult.bkashURL,
		};
	});

	return transactionResult;
};


/**
 * 2. Retry Payment checkout loop for an existing pending / UNPAID semester registration invoice
 */
const paySemesterRegistrationFee = async (payload: IPayRegistrationPayload, user: RequstUser) => {
	const { feeId } = payload;

	const existingFee = await prisma.studentFee.findUnique({
		where: { id: feeId },
	});

	if (!existingFee) {
		throw new AppError(httpStatus.NOT_FOUND, "Invoice Record Does Not Exist");
	}

	if (existingFee.status !== FeeStatus.UNPAID) {
		throw new AppError(httpStatus.CONFLICT, "This Invoice Is Already Paid Or Cancelled");
	}

	const bkashIdToken = await getBkashToken();
	if (!bkashIdToken) {
		throw new AppError(httpStatus.BAD_GATEWAY, "No bKash Access Token Found!");
	}

	const bkashCreatePaymentResponse = await fetch(
		`${config.bkash_base_url}/tokenized/checkout/create`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: bkashIdToken,
				"X-App-Key": config.bkash_app_key,
			},
			body: JSON.stringify({
				mode: "0011",
				payerReference: user.email,
				callbackURL: `${config.bkash_callback_url}/semester/payment/callback`,
				amount: existingFee.amount.toString(),
				currency: "BDT",
				intent: "sale",
				merchantInvoiceNumber: existingFee.merchantInvoiceNumber,
			}),
		},
	);

	const bkashCreatePaymentResult = await bkashCreatePaymentResponse.json();

	// Update active payment identification tracking tokens
	await prisma.studentFee.update({
		where: { id: existingFee.id },
		data: {
			bkashPaymentId: bkashCreatePaymentResult.paymentID,
		},
	});

	return {
		paymentUrl: bkashCreatePaymentResult.bkashURL,
	};
};

/**
 * 3. bKash Gateway Execute Webhook/Callback handler (IPN Instant Payment Verification)
 */
const bookSemesterPaymentCallback = async (query: Record<string, any>) => {
	const transactionResult = await prisma.$transaction(async (tx) => {
		const paymentId = query.paymentID;
		if (!paymentId) {
			throw new AppError(httpStatus.BAD_REQUEST, "Payment is missing");
		}
		const status = query.status;
		if (!status) {
			throw new AppError(httpStatus.BAD_REQUEST, "Payment Status is missing");
		}

		const bkashIdToken = await getBkashToken();

		if (!bkashIdToken) {
			throw new AppError(httpStatus.BAD_GATEWAY, "No bkash access token found!");
		}

		const executedPaymentResponse = await fetch(
			`${config.bkash_base_url}/tokenized/checkout/execute`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					Authorization: bkashIdToken,
					"X-App-Key": config.bkash_app_key,
				},
				body: JSON.stringify({
					paymentID: paymentId,
				}),
			},
		);

		const executedPaymentResult = await executedPaymentResponse.json();

		if (status === "success") {
			// Locate target invoice referencing the transaction payment identifier
			const studentFee = await tx.studentFee.findFirst({
				where: {
					merchantInvoiceNumber: executedPaymentResult.merchantInvoiceNumber
				},
				include: {
					student: {
						include: {
							department: true,
							program: true
						}
					},
					semester: true
				}
			});

			if (!studentFee) {
				throw new AppError(httpStatus.NOT_FOUND, "Semester Registration Invoice Record Not Found!");
			}

			// Finalize structural fee parameters tracking records inside transaction layer
			await tx.studentFee.update({
				where: {
					id: studentFee.id,
				},
				data: {
					status: FeeStatus.PAID,
					bkashTrxId: executedPaymentResult.trxID,
					paidAt: new Date(),
					// If your model contains a dynamic metadata field matching blueprint style:
					// getwayResponse: executedPaymentResult 
				},
			});

			// --- PDFKIT Dynamic Buffer Streaming Channel Generation ---
			const pdfDocument = new PDFDocument({ margin: 50 });
			const pdfChunks: Buffer[] = [];

			pdfDocument.on("data", (chunk: Buffer) => {
				pdfChunks.push(chunk);
			});

			const pdfReadyPromise = new Promise<Buffer>((resolve) => {
				pdfDocument.on("end", () => {
					resolve(Buffer.concat(pdfChunks));
				});
			});

			// Building layout structure precisely as blueprint guidelines dictate
			pdfDocument.fontSize(20).text("University Management System", { align: "center" });
			pdfDocument.fontSize(14).text("Semester Registration Receipt", { align: "center" });
			pdfDocument.moveDown(2);

			pdfDocument.fontSize(12).text(`Student Name: ${studentFee.student?.name}`);
			pdfDocument.text(`Student Institutional ID: ${studentFee.student?.studentId}`);
			pdfDocument.text(`Student Email: ${studentFee.student?.email}`);
			pdfDocument.moveDown();

			pdfDocument.text(`Department Name: ${studentFee.student?.department?.name || "N/A"}`);
			pdfDocument.text(`Program Name: ${studentFee.student?.program?.name || "N/A"}`);
			pdfDocument.text(`Academic Semester: ${studentFee.semester?.name || "N/A"}`);
			pdfDocument.moveDown();

			pdfDocument.text(`Amount Paid: ${executedPaymentResult.amount || studentFee.amount.toString()} BDT`);
			pdfDocument.text(`Payment Method: bKash Tokenized Checkout`);
			pdfDocument.text(`Transaction Id: ${executedPaymentResult.trxID}`);
			pdfDocument.text(`Paid At: ${new Date().toLocaleString()}`);

			pdfDocument.end();

			const pdfBuffer = await pdfReadyPromise;

			// Dispatch confirmation notification containing generated file metadata stream
			await transpoter.sendMail({
				from: config.email_sender,
				to: studentFee.student.email,
				subject: "Semester Registration Payment Invoice - University Management System",
				text: "Thank you for completing your semester payment. Please find your official receipt attached below.",
				attachments: [
					{
						filename: `Invoice-${executedPaymentResult.trxID}.pdf`,
						content: pdfBuffer
					}
				]
			});

			return {
				redirectUrl: `${config.frontend_url}/dashboard/semester?status=success`,
			};

		} else if (status === "failure") {
			await tx.studentFee.updateMany({
				where: {
					bkashPaymentId: paymentId,
				},
				data: {
					status: FeeStatus.FAILED,
				},
			});
			return {
				redirectUrl: `${config.frontend_url}/dashboard/semester?status=failure`,
			};
		} else if (status === "cancel") {
			await tx.studentFee.updateMany({
				where: {
					bkashPaymentId: paymentId,
				},
				data: {
					status: FeeStatus.FAILED, // Safely handle cancelled tracking flows mapping
				},
			});
			return {
				executedPaymentResult,
				redirectUrl: `${config.frontend_url}/dashboard/semester?status=cancel`,
			};
		} else {
			return {
				executedPaymentResult,
				redirectUrl: `${config.frontend_url}/dashboard/semester?error=payment-failed`,
			};
		}
	}, {
		maxWait: 10000, // Matching your precise blueprint configuration timeouts
		timeout: 30000, 
	});

	return transactionResult;
};

export const SemesterService = {
    createSemester,
	initiateSemesterRegistration,
	paySemesterRegistrationFee,
	bookSemesterPaymentCallback,
};
