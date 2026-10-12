import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupsSupJurisdictionsComponent } from './lookups-sup-jurisdictions.component';

describe('LookupsSupJurisdictionsComponent', () => {
  let component: LookupsSupJurisdictionsComponent;
  let fixture: ComponentFixture<LookupsSupJurisdictionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LookupsSupJurisdictionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookupsSupJurisdictionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
