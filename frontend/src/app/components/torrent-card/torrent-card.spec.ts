import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TorrentCard } from './torrent-card';

describe('TorrentCard', () => {
  let component: TorrentCard;
  let fixture: ComponentFixture<TorrentCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TorrentCard],
    }).compileComponents();

    fixture = TestBed.createComponent(TorrentCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
