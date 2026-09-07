export interface ICourseCreatePayload {
  code: string;        // e.g., "CSE-1101"
  title: string;       // e.g., "Structured Programming"
  credits: number;     // e.g., 3
  description?: string;
  departmentId: string;
}

export interface ICourseFilterRequest {
  searchTerm?: string;
  departmentId?: string;
}
