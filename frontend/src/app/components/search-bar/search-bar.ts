import { Component, inject, input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-bar.html',
})
export class SearchBar implements OnInit {
  initial = input<string>('');
  query = '';
  router = inject(Router);

  ngOnInit(): void {
    this.query = this.initial();
  }

  search() {
    const q = this.query.trim();
    if (!q) return;
    this.router.navigate(['search', q]);
  }
}
