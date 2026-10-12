import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedMatterFilterComponent } from './shared-matter-filter.component';

describe('SharedMatterFilterComponent', () => {
  let component: SharedMatterFilterComponent;
  let fixture: ComponentFixture<SharedMatterFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedMatterFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedMatterFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
