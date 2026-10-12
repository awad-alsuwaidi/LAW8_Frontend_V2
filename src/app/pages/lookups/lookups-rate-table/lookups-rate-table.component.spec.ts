import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupsRateTableComponent } from './lookups-rate-table.component';

describe('LookupsRateTableComponent', () => {
  let component: LookupsRateTableComponent;
  let fixture: ComponentFixture<LookupsRateTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LookupsRateTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookupsRateTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
