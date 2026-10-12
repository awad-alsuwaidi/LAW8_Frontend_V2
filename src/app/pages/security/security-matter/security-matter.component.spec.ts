import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityMatterComponent } from './security-matter.component';

describe('SecurityMatterComponent', () => {
  let component: SecurityMatterComponent;
  let fixture: ComponentFixture<SecurityMatterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityMatterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityMatterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
