import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedLanguageComponent } from './shared-language.component';

describe('SharedLanguageComponent', () => {
  let component: SharedLanguageComponent;
  let fixture: ComponentFixture<SharedLanguageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedLanguageComponent]
    });
    fixture = TestBed.createComponent(SharedLanguageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
