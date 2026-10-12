import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatterAddressEditorComponent } from './matter-address-editor.component';

describe('MatterAddressEditorComponent', () => {
  let component: MatterAddressEditorComponent;
  let fixture: ComponentFixture<MatterAddressEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatterAddressEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatterAddressEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
