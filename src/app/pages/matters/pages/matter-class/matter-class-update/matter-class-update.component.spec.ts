import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatterClassUpdateComponent } from './matter-class-update.component';

describe('MatterClassUpdateComponent', () => {
  let component: MatterClassUpdateComponent;
  let fixture: ComponentFixture<MatterClassUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatterClassUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatterClassUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
