import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityGroupsFilterComponent } from './security-groups-filter.component';

describe('SecurityGroupsFilterComponent', () => {
  let component: SecurityGroupsFilterComponent;
  let fixture: ComponentFixture<SecurityGroupsFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityGroupsFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityGroupsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
