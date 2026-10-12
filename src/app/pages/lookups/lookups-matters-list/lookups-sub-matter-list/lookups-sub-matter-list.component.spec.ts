import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupsSubMatterListComponent } from './lookups-sub-matter-list.component';

describe('LookupsSubMatterListComponent', () => {
  let component: LookupsSubMatterListComponent;
  let fixture: ComponentFixture<LookupsSubMatterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LookupsSubMatterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookupsSubMatterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
