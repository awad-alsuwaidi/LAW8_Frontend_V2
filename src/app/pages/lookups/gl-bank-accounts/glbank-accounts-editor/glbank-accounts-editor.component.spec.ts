import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlbankAccountsEditorComponent } from './glbank-accounts-editor.component';

describe('GlbankAccountsEditorComponent', () => {
  let component: GlbankAccountsEditorComponent;
  let fixture: ComponentFixture<GlbankAccountsEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlbankAccountsEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlbankAccountsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
