import { AttendanceStatus } from "../../../generated/prisma/enums";


export interface ICreateAttendance {
  date: Date;
  status: AttendanceStatus;
  studentId: string;
  sectionId: string;
  remarks?: string;
}

export interface IUpdateAttendance {
  date?: Date;
  status?: AttendanceStatus;
  studentId?: string;
  sectionId?: string;
  remarks?: string;
}