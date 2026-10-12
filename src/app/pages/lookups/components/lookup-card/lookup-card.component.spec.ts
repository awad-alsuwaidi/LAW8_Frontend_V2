import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupCardComponent } from './lookup-card.component';

describe('LookupCardComponent', () => {
  let component: LookupCardComponent;
  let fixture: ComponentFixture<LookupCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LookupCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookupCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
