import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupsCategoriesComponent } from './lookups-categories.component';

describe('LookupsCategoriesComponent', () => {
  let component: LookupsCategoriesComponent;
  let fixture: ComponentFixture<LookupsCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LookupsCategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookupsCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
