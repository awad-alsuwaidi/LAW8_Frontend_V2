import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsEditorMainInfoComponent } from './clients-editor-main-info.component';

describe('ClientsEditorMainInfoComponent', () => {
  let component: ClientsEditorMainInfoComponent;
  let fixture: ComponentFixture<ClientsEditorMainInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientsEditorMainInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientsEditorMainInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
