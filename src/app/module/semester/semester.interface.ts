export interface ICreateSemesterPayload {
  name: string;
  code: string;
  startDate: string | Date;
  endDate: string | Date;
  registrationOpen?: boolean;
}

export interface IUpdateSemesterPayload {
  name?: string;
  code?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  registrationOpen?: boolean;
}


// =====================================================
// PAYMENT INTERFACES
// =====================================================

export interface IInitializeRegistrationPayload {
  semesterId: string;
  amount: number;
  description: string;
}

export interface IPayRegistrationPayload {
  feeId: string;
}