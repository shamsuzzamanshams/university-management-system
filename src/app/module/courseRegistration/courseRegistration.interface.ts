export interface ICourseRegistrationPayload {
  academicSemesterId: string;
  courses: ISelectedCourse[];
}

export interface ISelectedCourse {
  courseId: string;
  sectionId: string;
}


export interface ICourseRegistrationQuery {
  studentId?: string;
  academicSemesterId?: string;
  status?: "ENROLLED" | "DROPPED" | "WITHDRAWN" 
}