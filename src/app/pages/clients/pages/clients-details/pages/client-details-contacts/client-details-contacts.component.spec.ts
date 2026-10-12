import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientDetailsContactsComponent } from './client-details-contacts.component';

describe('ClientDetailsContactsComponent', () => {
  let component: ClientDetailsContactsComponent;
  let fixture: ComponentFixture<ClientDetailsContactsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientDetailsContactsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientDetailsContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
