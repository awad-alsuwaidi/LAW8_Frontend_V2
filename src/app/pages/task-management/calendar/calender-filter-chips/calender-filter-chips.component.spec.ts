import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalenderFilterChipsComponent } from './calender-filter-chips.component';

describe('CalenderFilterChipsComponent', () => {
  let component: CalenderFilterChipsComponent;
  let fixture: ComponentFixture<CalenderFilterChipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalenderFilterChipsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalenderFilterChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
