import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientSkeletonComponent } from './client-skeleton.component';

describe('ClientSkeletonComponent', () => {
  let component: ClientSkeletonComponent;
  let fixture: ComponentFixture<ClientSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientSkeletonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
