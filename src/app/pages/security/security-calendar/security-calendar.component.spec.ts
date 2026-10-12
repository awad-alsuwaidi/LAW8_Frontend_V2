import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityCalendarComponent } from './security-calendar.component';

describe('SecurityCalendarComponent', () => {
  let component: SecurityCalendarComponent;
  let fixture: ComponentFixture<SecurityCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
