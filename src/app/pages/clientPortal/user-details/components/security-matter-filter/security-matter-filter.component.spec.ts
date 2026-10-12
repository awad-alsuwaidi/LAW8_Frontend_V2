import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityMatterFilterComponent } from './security-matter-filter.component';

describe('SecurityMatterFilterComponent', () => {
  let component: SecurityMatterFilterComponent;
  let fixture: ComponentFixture<SecurityMatterFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityMatterFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityMatterFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
