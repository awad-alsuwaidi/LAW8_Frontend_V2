import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedSearchDetailsComponent } from './advanced-search-details.component';

describe('AdvancedSearchDetailsComponent', () => {
  let component: AdvancedSearchDetailsComponent;
  let fixture: ComponentFixture<AdvancedSearchDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedSearchDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancedSearchDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
