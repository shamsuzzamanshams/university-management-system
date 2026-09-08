export interface ICreateSection {
  name: string;
  capacity: number;
  roomNumber?: string;
  schedule: string;
  semesterId: string;
  instructorId: string;
}

export interface IUpdateSection {
  name?: string;
  capacity?: number;
  roomNumber?: string;
  schedule?: string;
  semesterId?: string;
  instructorId?: string;
}