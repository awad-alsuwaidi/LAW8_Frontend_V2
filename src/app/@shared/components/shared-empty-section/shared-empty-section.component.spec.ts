import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedEmptySectionComponent } from './shared-empty-section.component';

describe('SharedEmptySectionComponent', () => {
  let component: SharedEmptySectionComponent;
  let fixture: ComponentFixture<SharedEmptySectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedEmptySectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedEmptySectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
