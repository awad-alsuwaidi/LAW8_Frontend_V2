import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankAccountsEditorComponent } from './bank-accounts-editor.component';

describe('BankAccountsEditorComponent', () => {
  let component: BankAccountsEditorComponent;
  let fixture: ComponentFixture<BankAccountsEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankAccountsEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankAccountsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
