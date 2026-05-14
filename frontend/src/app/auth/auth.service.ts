import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private accessToken: string | null = null;

  setToken(token: string) {
    this.accessToken = token;
  }

  getToken() {
    return this.accessToken;
  }

  clearToken() {
    this.accessToken = null;
  }
}
