import { Submission } from './submission.model';

export type AssignmentType = 'FILE' | 'MCQ' | 'PROGRAMMING';
export type AssignmentStatus = 'ACTIVE' | 'CLOSED' | 'ARCHIVED';

export interface MCQOption {
  optionLetter: string;
  optionText: string;
}

export interface MCQQuestion {
  _id: string;
  assignmentId: string;
  questionText: string;
  options: MCQOption[];
  correctOptionLetter?: string;
  marks: number;
}

export interface TestCase {
  _id?: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
  weight?: number;
}

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  type: AssignmentType;
  subjectId: any;
  departmentId: any;
  createdBy: any;
  dueDate: string;
  totalMarks: number;
  timeLimitMinutes?: number;
  problemStatement?: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  sampleInput?: string;
  sampleOutput?: string;
  allowedLanguages?: string[];
  testCases?: TestCase[];
  starterCode?: Record<string, string>;
  attachmentUrl?: string;
  attachmentName?: string;
  status: AssignmentStatus;
  submission?: Submission | null;
  createdAt?: string;
}
