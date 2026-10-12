import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityMatterResponsableLawyersComponent } from './security-matter-responsable-lawyers.component';

describe('SecurityMatterResponsableLawyersComponent', () => {
  let component: SecurityMatterResponsableLawyersComponent;
  let fixture: ComponentFixture<SecurityMatterResponsableLawyersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityMatterResponsableLawyersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityMatterResponsableLawyersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
