import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsCompanyLogoEditorComponent } from './settings-company-logo-editor.component';

describe('SettingsCompanyLogoEditorComponent', () => {
  let component: SettingsCompanyLogoEditorComponent;
  let fixture: ComponentFixture<SettingsCompanyLogoEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsCompanyLogoEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsCompanyLogoEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
