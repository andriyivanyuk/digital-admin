import { Injectable } from '@angular/core';
import { LoginResponse } from '../models/loginResponse';

@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  isAuthenticated: boolean = false;
  private tokenKey: string = 'AUTH_TOKEN';
  private userData: string = 'USER_DATA';

  constructor() {}

  public saveToken(token: string): void {
    sessionStorage.setItem(this.tokenKey, token);
  }

  public getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  public clearToken(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userData);
  }

  public setUserSession(result: LoginResponse): void {
    if (result.token) {
      const data = {
        username: result.user.username,
        email: result.user.email,
        token: result.token,
        userId: result.user.user_id,
      };
      this.setStorageItem(this.userData, JSON.stringify(data));
      this.isAuthenticated = true;
    } else {
      console.error('User token is undefined');
      this.isAuthenticated = false;
    }
  }

  public getUserSession(): any {
    const userData = sessionStorage.getItem(this.userData);
    return userData ? JSON.parse(userData) : null;
  }

  private setStorageItem(key: string, value: string): void {
    sessionStorage.setItem(key, value);
  }
}
