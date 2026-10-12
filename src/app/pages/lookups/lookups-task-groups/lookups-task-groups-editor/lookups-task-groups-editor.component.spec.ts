import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupsTaskGroupsEditorComponent } from './lookups-task-groups-editor.component';

describe('LookupsTaskGroupsEditorComponent', () => {
  let component: LookupsTaskGroupsEditorComponent;
  let fixture: ComponentFixture<LookupsTaskGroupsEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LookupsTaskGroupsEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookupsTaskGroupsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
