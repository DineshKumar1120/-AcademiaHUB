import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Assignment, MCQQuestion } from '../models/assignment.model';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private apiUrl = 'http://localhost:5000/api/assignments';

  constructor(private http: HttpClient) {}

  getAssignments(filters: { departmentId?: string; subjectId?: string; status?: string; search?: string; myOnly?: boolean } = {}): Observable<{ success: boolean; count: number; assignments: Assignment[] }> {
    let params = new HttpParams();
    if (filters.departmentId) params = params.set('departmentId', filters.departmentId);
    if (filters.subjectId) params = params.set('subjectId', filters.subjectId);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.myOnly) params = params.set('myOnly', 'true');

    return this.http.get<{ success: boolean; count: number; assignments: Assignment[] }>(this.apiUrl, { params });
  }

  getAssignmentById(id: string): Observable<{ success: boolean; assignment: Assignment; submission?: any }> {
    return this.http.get<{ success: boolean; assignment: Assignment; submission?: any }>(`${this.apiUrl}/${id}`);
  }

  getAssignmentQuestions(id: string): Observable<{ success: boolean; count: number; questions: MCQQuestion[] }> {
    return this.http.get<{ success: boolean; count: number; questions: MCQQuestion[] }>(`${this.apiUrl}/${id}/questions`);
  }

  createAssignment(formData: FormData): Observable<{ success: boolean; assignment: Assignment }> {
    return this.http.post<{ success: boolean; assignment: Assignment }>(this.apiUrl, formData);
  }

  updateAssignment(id: string, formData: FormData): Observable<{ success: boolean; assignment: Assignment }> {
    return this.http.put<{ success: boolean; assignment: Assignment }>(`${this.apiUrl}/${id}`, formData);
  }

  deleteAssignment(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
