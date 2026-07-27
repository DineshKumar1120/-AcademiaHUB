import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Department, Course, Subject } from '../models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = 'http://localhost:5000/api/departments';

  constructor(private http: HttpClient) {}

  // Departments
  getDepartments(): Observable<{ success: boolean; departments: Department[] }> {
    return this.http.get<{ success: boolean; departments: Department[] }>(`${this.apiUrl}/departments`);
  }

  createDepartment(data: any): Observable<{ success: boolean; department: Department }> {
    return this.http.post<{ success: boolean; department: Department }>(`${this.apiUrl}/departments`, data);
  }

  deleteDepartment(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/departments/${id}`);
  }

  // Courses
  getCourses(): Observable<{ success: boolean; courses: Course[] }> {
    return this.http.get<{ success: boolean; courses: Course[] }>(`${this.apiUrl}/courses`);
  }

  createCourse(data: any): Observable<{ success: boolean; course: Course }> {
    return this.http.post<{ success: boolean; course: Course }>(`${this.apiUrl}/courses`, data);
  }

  deleteCourse(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/courses/${id}`);
  }

  // Subjects
  getSubjects(): Observable<{ success: boolean; subjects: Subject[] }> {
    return this.http.get<{ success: boolean; subjects: Subject[] }>(`${this.apiUrl}/subjects`);
  }

  createSubject(data: any): Observable<{ success: boolean; subject: Subject }> {
    return this.http.post<{ success: boolean; subject: Subject }>(`${this.apiUrl}/subjects`, data);
  }

  deleteSubject(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/subjects/${id}`);
  }
}
