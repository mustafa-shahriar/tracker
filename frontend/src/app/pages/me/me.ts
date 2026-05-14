import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../components/navbar/navbar';
import { TorrentCard } from '../../components/torrent-card/torrent-card';
import { BatchGetFromApiType, TorrentCardProp } from '../../app.types';
import { transformApiData } from '../../app.utils';

@Component({
  selector: 'app-me',
  standalone: true,
  imports: [Navbar, TorrentCard],
  templateUrl: './me.html',
})
export class Me implements OnInit {
  private http = inject(HttpClient);
  torrents = signal<TorrentCardProp[] | undefined>(undefined);
  error = signal('');

  ngOnInit(): void {
    this.http.get<BatchGetFromApiType>('/torrent/my_torrents').subscribe({
      next: (res) => {
        this.torrents.set(transformApiData(res));
      },
      error: () => {
        this.error.set('Error fetching your torrents');
      },
    });
  }
}
