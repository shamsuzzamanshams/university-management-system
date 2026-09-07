export interface ISelectedCoursePayload {
  courseId: string;
  sectionId: string;
}

export interface ICourseRegistrationPayload {
  semesterId: string;
  academicYear: number; // e.g., 1, 2, 3, 4
  semester: number; // e.g., 1 to 8
  courses: ISelectedCoursePayload[];
}