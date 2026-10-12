import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedContactComponent } from './shared-contact.component';

describe('SharedContactComponent', () => {
  let component: SharedContactComponent;
  let fixture: ComponentFixture<SharedContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedContactComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
