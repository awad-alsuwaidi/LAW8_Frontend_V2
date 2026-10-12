import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatterPartyEditorComponent } from './matter-party-editor.component';

describe('MatterPartyEditorComponent', () => {
  let component: MatterPartyEditorComponent;
  let fixture: ComponentFixture<MatterPartyEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatterPartyEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatterPartyEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
