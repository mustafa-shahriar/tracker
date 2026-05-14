import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';
import { BytesPipe } from '../../pipe/bytes.pipe';
import { TorrentType } from '../../app.types';

@Component({
  selector: 'app-torrent',
  standalone: true,
  imports: [CommonModule, Navbar, BytesPipe],
  templateUrl: './torrent.html',
})
export class Torrent implements OnInit {
  readonly id: string;
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  torrent = signal<TorrentType | undefined>(undefined);
  error = signal('');
  downloading = signal(false);

  constructor() {
    this.id = this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.http.get<TorrentType>(`/torrent/${this.id}`).subscribe({
      next: (res) => this.torrent.set(res),
      error: () => this.error.set('Error fetching torrent'),
    });
  }

  downloadTorrent() {
    this.downloading.set(true);
    this.http
      .get(`/torrent/${this.id}/download`, {
        responseType: 'blob',
      })
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = url;
          a.download = `${this.torrent()?.title}.torrent`;

          a.click();
          window.URL.revokeObjectURL(url);

          this.downloading.set(false);
        },
        error: () => this.error.set('Error Downloading File'),
      });
  }
}
