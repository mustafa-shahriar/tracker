import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { catchError, filter, Observable, Subject, switchMap, take, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { Environment } from '../../environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new Subject<string>();

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
  ) {}

  private addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private logout() {
    this.authService.clearToken();
    this.router.navigate(['/login']);
  }

  private handleError(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap((token) => next.handle(this.addToken(req, token))),
      );
    }

    this.isRefreshing = true;

    return this.http
      .post<{ accessToken: string }>('/auth/refresh', {}, { withCredentials: true })
      .pipe(
        switchMap((res) => {
          this.isRefreshing = false;
          const token = res.accessToken;
          this.authService.setToken(token);
          this.refreshTokenSubject.next(token);
          return next.handle(this.addToken(req, token));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.error(err);
          this.logout();
          return throwError(() => err);
        }),
      );
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.startsWith('/')) {
      req = req.clone({
        url: Environment.baseUrl + req.url,
        withCredentials: true,
      });
    }

    if (
      req.url.includes('/auth/login') ||
      req.url.includes('/auth/register') ||
      req.url.includes('/auth/logout')
    ) {
      console.log('returning from interceptor');
      return next.handle(req);
    }

    const token = this.authService.getToken();
    if (token) {
      req = this.addToken(req, token);
    }

    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status !== 401) {
          return throwError(() => err);
        }

        if (req.url.includes('/auth/refresh')) {
          this.logout();
          return throwError(() => err);
        }

        return this.handleError(req, next);
      }),
    );
  }
}
