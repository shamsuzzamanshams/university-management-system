export interface ISemesterRegistrationPayload {
  studentId: string;
  semesterId: string;
  amount: number;       // Passed from client or computed
  description: string;  // e.g., "Fall 2026 Registration Fee"
  payerReference?: string; 
}

export interface IBkashCallbackPayload {
  paymentID: string;            // bKash gateway payment identity string
  trxID: string;                // bKash network unique transaction identifier
  merchantInvoiceNumber: string; // The unique invoice matching your table
  transactionStatus: "Completed" | "Failed" | "Cancelled";
}

export interface IInitializeRegistrationPayload {
    semesterId: string;
	studentId: string;
	amount: number;
	description: string;
}

export interface IPayRegistrationPayload {
	feeId: string;
}

export interface ICreateSemesterPayload {
	name: string;
	code: string;       // e.g., "AUTUMN2026", "FALL2026"
	startDate: string;  // Parsed from client date pickers
	endDate: string;
	registrationOpen?: boolean;
}