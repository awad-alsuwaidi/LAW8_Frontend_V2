import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatterActivityComponent } from './matter-activity.component';

describe('MatterActivityComponent', () => {
  let component: MatterActivityComponent;
  let fixture: ComponentFixture<MatterActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatterActivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatterActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
