import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatterAddressComponent } from './matter-address.component';

describe('MatterAddressComponent', () => {
  let component: MatterAddressComponent;
  let fixture: ComponentFixture<MatterAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatterAddressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatterAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
