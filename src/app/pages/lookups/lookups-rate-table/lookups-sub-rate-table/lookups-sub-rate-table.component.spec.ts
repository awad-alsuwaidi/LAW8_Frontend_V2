import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupsSubRateTableComponent } from './lookups-sub-rate-table.component';

describe('LookupsSubRateTableComponent', () => {
  let component: LookupsSubRateTableComponent;
  let fixture: ComponentFixture<LookupsSubRateTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LookupsSubRateTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookupsSubRateTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
