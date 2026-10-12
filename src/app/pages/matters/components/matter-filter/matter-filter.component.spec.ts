import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatterFilterComponent } from './matter-filter.component';

describe('MatterFilterComponent', () => {
  let component: MatterFilterComponent;
  let fixture: ComponentFixture<MatterFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatterFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatterFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
