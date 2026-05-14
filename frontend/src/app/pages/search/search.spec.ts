import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Seach } from './seach';

describe('Seach', () => {
  let component: Seach;
  let fixture: ComponentFixture<Seach>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Seach],
    }).compileComponents();

    fixture = TestBed.createComponent(Seach);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
