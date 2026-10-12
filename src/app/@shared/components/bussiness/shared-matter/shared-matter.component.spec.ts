import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedMatterComponent } from './shared-matter.component';

describe('SharedMatterComponent', () => {
  let component: SharedMatterComponent;
  let fixture: ComponentFixture<SharedMatterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedMatterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedMatterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
