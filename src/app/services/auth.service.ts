import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoginRequest } from '../models/loginRequest';
import { User } from '../models/user';

@Injectable()
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  public login(request: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, request);
  }

  public register(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  public verifyEmail(token: string): Observable<any> {
    return this.http.get(this.apiUrl + '/verify/' + token);
  }

  public isLoggedIn(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }
}
