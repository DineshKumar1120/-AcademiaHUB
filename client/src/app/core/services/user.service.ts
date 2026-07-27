import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5000/api/users';
  private statsUrl = 'http://localhost:5000/api/stats';

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<{ success: boolean; role: string; stats: any }> {
    return this.http.get<{ success: boolean; role: string; stats: any }>(`${this.statsUrl}/dashboard`);
  }

  getUsers(role?: string, search?: string): Observable<{ success: boolean; count: number; users: User[] }> {
    let params = new HttpParams();
    if (role) params = params.set('role', role);
    if (search) params = params.set('search', search);

    return this.http.get<{ success: boolean; count: number; users: User[] }>(this.apiUrl, { params });
  }

  getStudents(): Observable<{ success: boolean; count: number; students: any[] }> {
    return this.http.get<{ success: boolean; count: number; students: any[] }>(`${this.apiUrl}/students`);
  }

  getFaculty(): Observable<{ success: boolean; count: number; faculty: any[] }> {
    return this.http.get<{ success: boolean; count: number; faculty: any[] }>(`${this.apiUrl}/faculty`);
  }

  createUser(userData: any): Observable<{ success: boolean; user: User }> {
    return this.http.post<{ success: boolean; user: User }>(this.apiUrl, userData);
  }

  toggleUserStatus(id: string): Observable<{ success: boolean; message: string; user: User }> {
    return this.http.put<{ success: boolean; message: string; user: User }>(`${this.apiUrl}/${id}/status`, {});
  }

  deleteUser(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
