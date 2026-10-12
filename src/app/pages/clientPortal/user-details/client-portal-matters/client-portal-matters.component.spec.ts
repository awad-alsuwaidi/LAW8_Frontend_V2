import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPortalMattersComponent } from './client-portal-matters.component';

describe('ClientPortalMattersComponent', () => {
  let component: ClientPortalMattersComponent;
  let fixture: ComponentFixture<ClientPortalMattersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientPortalMattersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientPortalMattersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
