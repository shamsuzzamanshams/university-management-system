export interface ICreateExam {
  title: string;
  maxMarks: number;
  weightage: number;
  examDate: Date;
  sectionId: string;
}

export interface IUpdateExam {
  title?: string;
  maxMarks?: number;
  weightage?: number;
  examDate?: Date;
  sectionId?: string;
}

export interface ICreateExamResult {
  marksObtained: number;
  examId: string;
  studentId: string;
}

export interface IUpdateExamResult {
  marksObtained?: number;
}