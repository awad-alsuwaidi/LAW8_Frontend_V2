import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsSystemCurrencyComponent } from './settings-system-currency.component';

describe('SettingsSystemCurrencyComponent', () => {
  let component: SettingsSystemCurrencyComponent;
  let fixture: ComponentFixture<SettingsSystemCurrencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsSystemCurrencyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsSystemCurrencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
