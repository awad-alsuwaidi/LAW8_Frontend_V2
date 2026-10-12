import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeesFilterComponent } from './fees-filter.component';

describe('FeesFilterComponent', () => {
  let component: FeesFilterComponent;
  let fixture: ComponentFixture<FeesFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeesFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeesFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
