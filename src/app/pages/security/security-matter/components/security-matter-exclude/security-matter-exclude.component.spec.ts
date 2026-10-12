import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityMatterExcludeComponent } from './security-matter-exclude.component';

describe('SecurityMatterExcludeComponent', () => {
  let component: SecurityMatterExcludeComponent;
  let fixture: ComponentFixture<SecurityMatterExcludeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityMatterExcludeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityMatterExcludeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
