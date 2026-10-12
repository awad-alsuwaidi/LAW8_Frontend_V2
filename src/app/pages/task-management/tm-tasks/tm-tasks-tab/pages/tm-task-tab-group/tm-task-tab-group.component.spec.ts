import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TmTaskTabGroupComponent } from './tm-task-tab-group.component';

describe('TmTaskTabGroupComponent', () => {
  let component: TmTaskTabGroupComponent;
  let fixture: ComponentFixture<TmTaskTabGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TmTaskTabGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TmTaskTabGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
