import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Submission } from '../models/submission.model';

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {
  private apiUrl = 'http://localhost:5000/api/submissions';

  constructor(private http: HttpClient) {}

  submitAssignment(formData: FormData): Observable<{ success: boolean; message: string; submission: Submission }> {
    return this.http.post<{ success: boolean; message: string; submission: Submission }>(`${this.apiUrl}/upload`, formData);
  }

  submitMCQ(data: { assignmentId: string; answers: any[] }): Observable<{ success: boolean; message: string; score: number; totalMarks: number; submission: Submission }> {
    return this.http.post<{ success: boolean; message: string; score: number; totalMarks: number; submission: Submission }>(`${this.apiUrl}/mcq/submit`, data);
  }

  runCode(data: { assignmentId: string; code: string; language: string }): Observable<{
    success: boolean;
    status: string;
    allPassed: boolean;
    compilationError?: string;
    testResults: any[];
  }> {
    return this.http.post<{
      success: boolean;
      status: string;
      allPassed: boolean;
      compilationError?: string;
      testResults: any[];
    }>(`${this.apiUrl}/programming/run`, data);
  }

  submitProgramming(data: { assignmentId: string; code: string; programmingCode?: string; language: string }): Observable<{
    success: boolean;
    message: string;
    marksObtained?: number;
    totalMarks?: number;
    passedTestCases?: number;
    totalTestCases?: number;
    testResults?: any[];
    submission: Submission;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      marksObtained?: number;
      totalMarks?: number;
      passedTestCases?: number;
      totalTestCases?: number;
      testResults?: any[];
      submission: Submission;
    }>(`${this.apiUrl}/programming/submit`, data);
  }

  getSubmissionsByAssignment(assignmentId: string): Observable<{ success: boolean; assignment: any; count: number; submissions: Submission[] }> {
    return this.http.get<{ success: boolean; assignment: any; count: number; submissions: Submission[] }>(`${this.apiUrl}/assignment/${assignmentId}`);
  }

  gradeSubmission(submissionId: string, gradeData: { marksObtained: number; feedback?: string }): Observable<{ success: boolean; message: string; submission: Submission }> {
    return this.http.put<{ success: boolean; message: string; submission: Submission }>(`${this.apiUrl}/${submissionId}/grade`, gradeData);
  }

  getDownloadUrl(filename: string): string {
    return `http://localhost:5000/api/submissions/download/${filename}`;
  }
}
