import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatterDetailInfoComponent } from './matter-detail-info.component';

describe('MatterDetailInfoComponent', () => {
  let component: MatterDetailInfoComponent;
  let fixture: ComponentFixture<MatterDetailInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatterDetailInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatterDetailInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
