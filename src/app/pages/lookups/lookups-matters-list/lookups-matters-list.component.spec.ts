import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupsMattersListComponent } from './lookups-matters-list.component';

describe('LookupsMattersListComponent', () => {
  let component: LookupsMattersListComponent;
  let fixture: ComponentFixture<LookupsMattersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LookupsMattersListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookupsMattersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
