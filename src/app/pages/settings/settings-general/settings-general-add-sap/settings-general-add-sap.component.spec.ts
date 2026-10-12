import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsGeneralAddSapComponent } from './settings-general-add-sap.component';

describe('SettingsGeneralAddSapComponent', () => {
  let component: SettingsGeneralAddSapComponent;
  let fixture: ComponentFixture<SettingsGeneralAddSapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsGeneralAddSapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsGeneralAddSapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
