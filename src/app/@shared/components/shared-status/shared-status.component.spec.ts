import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedStatusComponent } from './shared-status.component';

describe('SharedStatusComponent', () => {
  let component: SharedStatusComponent;
  let fixture: ComponentFixture<SharedStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
