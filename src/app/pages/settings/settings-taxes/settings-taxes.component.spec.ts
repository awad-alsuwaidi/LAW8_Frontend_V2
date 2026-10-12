import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsTaxesComponent } from './settings-taxes.component';

describe('SettingsTaxesComponent', () => {
  let component: SettingsTaxesComponent;
  let fixture: ComponentFixture<SettingsTaxesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsTaxesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsTaxesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
