import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedSearchComponent } from './shared-search.component';

describe('SharedSearchComponent', () => {
  let component: SharedSearchComponent;
  let fixture: ComponentFixture<SharedSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
