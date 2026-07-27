export interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
}

export interface Course {
  _id: string;
  name: string;
  code: string;
  departmentId: any;
  durationYears: number;
}

export interface Subject {
  _id: string;
  name: string;
  code: string;
  departmentId: any;
  courseId: any;
  semester: number;
  facultyId?: any;
}
