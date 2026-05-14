import { Component, input } from '@angular/core';
import { TorrentCardProp } from '../../app.types';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BytesPipe } from '../../pipe/bytes.pipe';

@Component({
  selector: 'app-torrent-card',
  standalone: true,
  imports: [RouterLink, DatePipe, BytesPipe],
  templateUrl: './torrent-card.html',
  styleUrl: './torrent-card.css',
})
export class TorrentCard {
  torrent = input.required<TorrentCardProp>();
}
