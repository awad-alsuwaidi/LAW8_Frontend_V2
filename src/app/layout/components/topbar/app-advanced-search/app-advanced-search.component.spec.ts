import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppAdvancedSearchComponent } from './app-advanced-search.component';

describe('AppAdvancedSearchComponent', () => {
  let component: AppAdvancedSearchComponent;
  let fixture: ComponentFixture<AppAdvancedSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppAdvancedSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppAdvancedSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
