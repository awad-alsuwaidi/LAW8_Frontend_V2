import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsEditorComponent } from './clients-editor.component';

describe('ClientsEditorComponent', () => {
  let component: ClientsEditorComponent;
  let fixture: ComponentFixture<ClientsEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientsEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
