import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvalidSubdomainComponent } from './invalid-subdomain.component';

describe('InvalidSubdomainComponent', () => {
  let component: InvalidSubdomainComponent;
  let fixture: ComponentFixture<InvalidSubdomainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvalidSubdomainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvalidSubdomainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
