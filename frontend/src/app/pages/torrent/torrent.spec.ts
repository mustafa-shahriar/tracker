import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Torrent } from './torrent';

describe('Torrent', () => {
  let component: Torrent;
  let fixture: ComponentFixture<Torrent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Torrent],
    }).compileComponents();

    fixture = TestBed.createComponent(Torrent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
