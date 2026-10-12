import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedSkeletonComponent } from './shared-skeleton.component';

describe('SharedSkeletonComponent', () => {
  let component: SharedSkeletonComponent;
  let fixture: ComponentFixture<SharedSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedSkeletonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
