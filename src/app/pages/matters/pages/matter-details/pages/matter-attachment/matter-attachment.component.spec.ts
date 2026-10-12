import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatterAttachmentComponent } from './matter-attachment.component';

describe('MatterAttachmentComponent', () => {
  let component: MatterAttachmentComponent;
  let fixture: ComponentFixture<MatterAttachmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatterAttachmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatterAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
