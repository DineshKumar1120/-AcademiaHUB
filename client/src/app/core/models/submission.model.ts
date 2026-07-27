export type SubmissionStatus = 'SUBMITTED' | 'GRADED' | 'LATE';

export interface TestCaseResult {
  testCaseIndex?: number;
  input?: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  error?: string;
  isHidden?: boolean;
}

export interface Submission {
  _id: string;
  assignmentId: any;
  studentId: any;
  fileUrl?: string;
  fileName?: string;
  mcqAnswers?: any[];
  programmingCode?: string;
  code?: string;
  language?: string;
  testResults?: TestCaseResult[];
  passedTestCases?: number;
  totalTestCases?: number;
  submissionDate: string;
  status: SubmissionStatus;
  marksObtained?: number | null;
  feedback?: string;
  gradedBy?: any;
  gradedAt?: string;
}
