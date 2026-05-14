import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';
import { TorrentCard } from '../../components/torrent-card/torrent-card';
import { BatchGetFromApiType, TorrentCardProp } from '../../app.types';
import { transformApiData } from '../../app.utils';
import { SearchBar } from '../../components/search-bar/search-bar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Navbar, TorrentCard, CommonModule, SearchBar],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private http = inject(HttpClient);
  torrents = signal<TorrentCardProp[] | undefined>(undefined);
  error = signal<string>('');

  ngOnInit(): void {
    this.http.get<BatchGetFromApiType>('/torrent/recent').subscribe({
      next: (res) => this.torrents.set(transformApiData(res)),
      error: (_) => this.error.set('Error fetching data'),
    });
  }
}
