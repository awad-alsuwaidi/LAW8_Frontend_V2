import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPortalClientsComponent } from './client-portal-clients.component';

describe('ClientPortalClientsComponent', () => {
  let component: ClientPortalClientsComponent;
  let fixture: ComponentFixture<ClientPortalClientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientPortalClientsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientPortalClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
