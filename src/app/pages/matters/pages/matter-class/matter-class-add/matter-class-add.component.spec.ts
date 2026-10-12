import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatterClassAddComponent } from './matter-class-add.component';

describe('MatterClassAddComponent', () => {
  let component: MatterClassAddComponent;
  let fixture: ComponentFixture<MatterClassAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatterClassAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatterClassAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
