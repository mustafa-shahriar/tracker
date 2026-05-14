import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-torrent',
  imports: [],
  templateUrl: './torrent.html',
  styleUrl: './torrent.css',
})
export class Torrent {
  readonly id: string;
  private route = inject(ActivatedRoute);

  constructor() {
    this.id = this.route.snapshot.paramMap.get('id')!;
  }
}
