import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopbarTimerComponent } from './topbar-timer.component';

describe('TopbarTimerComponent', () => {
  let component: TopbarTimerComponent;
  let fixture: ComponentFixture<TopbarTimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopbarTimerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopbarTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
