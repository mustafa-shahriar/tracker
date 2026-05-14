import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-search',
  imports: [Navbar],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search {
  readonly q: string;
  private route = inject(ActivatedRoute);

  constructor() {
    this.q = this.route.snapshot.paramMap.get('q')!;
  }
}
