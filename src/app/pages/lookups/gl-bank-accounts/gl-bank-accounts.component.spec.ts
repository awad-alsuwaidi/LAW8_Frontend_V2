import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlBankAccountsComponent } from './gl-bank-accounts.component';

describe('GlBankAccountsComponent', () => {
  let component: GlBankAccountsComponent;
  let fixture: ComponentFixture<GlBankAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlBankAccountsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlBankAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
