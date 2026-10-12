import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationFilterEditorComponent } from './notification-filter-editor.component';

describe('NotificationFilterEditorComponent', () => {
  let component: NotificationFilterEditorComponent;
  let fixture: ComponentFixture<NotificationFilterEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationFilterEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationFilterEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
