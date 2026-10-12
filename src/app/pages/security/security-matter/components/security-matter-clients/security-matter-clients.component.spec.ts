import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityMatterClientsComponent } from './security-matter-clients.component';

describe('SecurityMatterClientsComponent', () => {
  let component: SecurityMatterClientsComponent;
  let fixture: ComponentFixture<SecurityMatterClientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityMatterClientsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityMatterClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
