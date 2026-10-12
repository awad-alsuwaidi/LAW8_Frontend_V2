import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalenderFilterComponent } from './calender-filter.component';

describe('CalenderFilterComponent', () => {
  let component: CalenderFilterComponent;
  let fixture: ComponentFixture<CalenderFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalenderFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalenderFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
