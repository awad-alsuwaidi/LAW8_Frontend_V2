import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedBreadcrumbComponent } from './shared-breadcrumb.component';

describe('SharedBreadcrumbComponent', () => {
  let component: SharedBreadcrumbComponent;
  let fixture: ComponentFixture<SharedBreadcrumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedBreadcrumbComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
