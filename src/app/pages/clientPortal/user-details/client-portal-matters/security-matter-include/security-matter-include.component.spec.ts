import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityMatterIncludeComponent } from './security-matter-include.component';

describe('SecurityMatterIncludeComponent', () => {
  let component: SecurityMatterIncludeComponent;
  let fixture: ComponentFixture<SecurityMatterIncludeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityMatterIncludeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityMatterIncludeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
