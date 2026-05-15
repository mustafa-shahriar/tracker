import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { HttpClient } from '@angular/common/http';
import { BatchGetFromApiType, TorrentCardProp } from '../../app.types';
import { transformApiData } from '../../app.utils';
import { SearchBar } from '../../components/search-bar/search-bar';
import { TorrentCard } from '../../components/torrent-card/torrent-card';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-search',
  imports: [Navbar, SearchBar, TorrentCard],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  torrents = signal<TorrentCardProp[] | undefined>(undefined);
  error = signal<string>('');
  q = signal<string>('');

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const q = params.get('q');
          this.q.set(q!);
          this.torrents.set(undefined);
          return this.http.get<BatchGetFromApiType>(`/torrent/search/${q}`);
        }),
      )
      .subscribe({
        next: (res) => {
          console.log(res);
          this.torrents.set(transformApiData(res));
        },
        error: (err) => {
          console.log(err);
          this.error.set('Error fetching data');
        },
      });
  }
}
