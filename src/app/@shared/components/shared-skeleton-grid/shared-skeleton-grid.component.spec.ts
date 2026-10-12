import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedSkeletonGridComponent } from './shared-skeleton-grid.component';

describe('SharedSkeletonGridComponent', () => {
  let component: SharedSkeletonGridComponent;
  let fixture: ComponentFixture<SharedSkeletonGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedSkeletonGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedSkeletonGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
