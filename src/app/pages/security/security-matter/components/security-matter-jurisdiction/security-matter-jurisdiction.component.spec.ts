import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityMatterJurisdictionComponent } from './security-matter-jurisdiction.component';

describe('SecurityMatterJurisdictionComponent', () => {
  let component: SecurityMatterJurisdictionComponent;
  let fixture: ComponentFixture<SecurityMatterJurisdictionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityMatterJurisdictionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityMatterJurisdictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
