import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  private tokenKey: string = 'AUTH_TOKEN';

  constructor() {}

  public saveToken(token: string): void {
    sessionStorage.setItem(this.tokenKey, token);
  }

  public getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  public clearToken(): void {
    sessionStorage.removeItem(this.tokenKey);
  }
}
