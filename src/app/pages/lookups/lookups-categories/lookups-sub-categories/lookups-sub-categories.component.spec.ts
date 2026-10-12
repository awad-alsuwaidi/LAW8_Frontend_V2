import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupsSubCategoriesComponent } from './lookups-sub-categories.component';

describe('LookupsSubCategoriesComponent', () => {
  let component: LookupsSubCategoriesComponent;
  let fixture: ComponentFixture<LookupsSubCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LookupsSubCategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookupsSubCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
