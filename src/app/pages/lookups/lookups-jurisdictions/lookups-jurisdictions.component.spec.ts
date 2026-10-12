import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupsJurisdictionsComponent } from './lookups-jurisdictions.component';

describe('LookupsJurisdictionsComponent', () => {
  let component: LookupsJurisdictionsComponent;
  let fixture: ComponentFixture<LookupsJurisdictionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LookupsJurisdictionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookupsJurisdictionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
