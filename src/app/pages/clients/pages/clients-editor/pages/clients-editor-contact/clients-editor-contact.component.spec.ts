import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsEditorContactComponent } from './clients-editor-contact.component';

describe('ClientsEditorContactComponent', () => {
  let component: ClientsEditorContactComponent;
  let fixture: ComponentFixture<ClientsEditorContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientsEditorContactComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientsEditorContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
