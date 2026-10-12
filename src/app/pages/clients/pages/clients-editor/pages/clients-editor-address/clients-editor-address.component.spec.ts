import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsEditorAddressComponent } from './clients-editor-address.component';

describe('ClientsEditorAddressComponent', () => {
  let component: ClientsEditorAddressComponent;
  let fixture: ComponentFixture<ClientsEditorAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientsEditorAddressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientsEditorAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
