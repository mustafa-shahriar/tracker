import { Component, inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private auth = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

  logout() {
    this.http.post('/auth/logout', {}, { withCredentials: true }).subscribe({
      next: (res) => console.log(res),
      error: (err) => console.log(err),
    });
    this.auth.clearToken();
    this.router.navigate(['login']);
  }
}
