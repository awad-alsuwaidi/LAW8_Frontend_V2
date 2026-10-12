import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientDetailsContactsEditorComponent } from './client-details-contacts-editor.component';

describe('ClientDetailsContactsEditorComponent', () => {
  let component: ClientDetailsContactsEditorComponent;
  let fixture: ComponentFixture<ClientDetailsContactsEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientDetailsContactsEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientDetailsContactsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
