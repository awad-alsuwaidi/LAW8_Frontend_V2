import {
  Component,
  effect,
  EventEmitter,
  inject,
  input,
  InputSignal,
  Output,
  output,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { SharedSearchComponent } from 'src/app/@shared/components/shared-search/shared-search.component';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormlyModule } from '@ngx-formly/core';

@Component({
  selector: 'app-security-group-editor-permissions',
  standalone: true,
  imports: [
    AccordionModule,
    CheckboxModule,
    FormsModule,
    TriStateCheckboxModule,
    SharedSearchComponent,
    ScrollPanelModule,
    RouterModule
  ],
  templateUrl: './security-group-editor-permissions.component.html',
  styleUrl: './security-group-editor-permissions.component.scss',
})
export class SecurityGroupEditorPermissionsComponent {
  _router = inject(Router);
  _route = inject(ActivatedRoute);

  permissionSections: InputSignal<any[]> = input<any[]>([]);
  permissionSectionsDetails: InputSignal<any[]> = input<any[]>([]);

  onCheck = output<string[]>();
  search = output<string>();
  activeIndexes: WritableSignal<number[]> = signal<number[]>([]);
  selectedItem: any;

  selectedPermissionsMap: Record<number, string[]> = {};

  // تحديث tri-state checkbox تلقائيًا عند أي تغيير في التفاصيل
  signalEffect = effect(
    () => {
      const sections = this.permissionSectionsDetails();
      if (sections?.length) {
        const openIndexes: number[] = [];
        sections.forEach((section, index) => {
          if (section.roleModulesItems?.some((p: any) => p.isSelected)) {
            openIndexes.push(index);
          }
        });
        this.activeIndexes.set(openIndexes);
        this.updateAllMainCheckboxStates();
      }
    },
    { allowSignalWrites: true }
  );
constructor() {
  // نراقب الـ permissionSections Signal أول ما البيانات تتغير
  effect(() => {
    const sections = this.permissionSections();
    if (sections?.length && !this.selectedItem) {
      this.selectedItem = sections[0]; // أول عنصر
      this.onMenuItemClick.emit(sections[0].id); // نبعته للأب لو في حاجة بتعتمد عليه
    }
  });
}

  // تحديث حالة كل الـ main checkboxes
  updateAllMainCheckboxStates() {
    this.permissionSectionsDetails().forEach((section, index) => {
      this.updateMainCheckboxState(index);
    });
  }

  @Output() onMenuItemClick = new EventEmitter<any>(); // ✅ هنا بدل output()
  // تحديث tri-state checkbox لحالة section معين
  updateMainCheckboxState(sectionIndex: number) {
    const section = this.permissionSectionsDetails()[sectionIndex];
    if (!section?.roleModulesItems?.length) return;

    const total = section.roleModulesItems.length;
    const checkedCount = section.roleModulesItems.filter(
      (p: { isSelected: any }) => p.isSelected
    ).length;

    if (checkedCount === 0) section.mainChecked = null;
    else if (checkedCount === total) section.mainChecked = true;
    else section.mainChecked = false;

    this.emitSelectedPermissions();
  }

  onMainCheckboxChange(sectionIndex: number, event: any) {
    const section = this.permissionSectionsDetails()[sectionIndex];
    if (!section?.roleModulesItems?.length) return;

    const newValue = event.value === true;

    section.roleModulesItems.forEach(
      (p: { isSelected: boolean }) => (p.isSelected = newValue)
    );

    const originalSection = this.permissionSections().find(
      (s) => s.id === section.id
    );

    if (newValue) {
      this.selectedPermissionsMap[section.id] = section.roleModulesItems.map(
        (p: { id: any }) => p.id
      );
      if (originalSection)
        originalSection.itemsSelected = [
          ...section.roleModulesItems.map((p: { id: any }) => p.id),
        ];
    } else {
      delete this.selectedPermissionsMap[section.id];
      if (originalSection) originalSection.itemsSelected = [];
    }

    this.syncSectionUI(section.id);
  }
  onPermissionChange(
    sectionIndex: number,
    permissionIndex: number,
    event: any
  ) {
    const section = this.permissionSectionsDetails()[sectionIndex];
    if (!section?.roleModulesItems?.[permissionIndex]) return;

    section.roleModulesItems[permissionIndex].isSelected = event.checked;

    // تحديث map
    const selectedIds = section.roleModulesItems
      .filter((p: any) => p.isSelected)
      .map((p: any) => p.id);

    if (selectedIds.length === 0) {
      delete this.selectedPermissionsMap[section.id];
      // 🔹 امسح الـ itemsSelected من الـ roleMenuWithCount مباشرة
      const originalSection = this.permissionSections().find(
        (s) => s.id === section.id
      );
      if (originalSection) originalSection.itemsSelected = [];
    } else {
      this.selectedPermissionsMap[section.id] = selectedIds;
      const originalSection = this.permissionSections().find(
        (s) => s.id === section.id
      );
      if (originalSection) originalSection.itemsSelected = [...selectedIds];
    }

    this.syncSectionUI(section.id);
  }

  // تحديث الـ UI بناءً على الـ map عند استدعاء API أو refresh
  syncSectionUI(sectionId: number) {
    const section = this.permissionSectionsDetails().find(
      (s) => s.id === sectionId
    );
    if (!section) return;

    const selectedIds = this.selectedPermissionsMap[sectionId] || [];
    section.roleModulesItems.forEach(
      (item: { isSelected: boolean; id: string }) => {
        item.isSelected = selectedIds.includes(item.id);
      }
    );

    const index = this.permissionSectionsDetails().indexOf(section);
    this.updateMainCheckboxState(index);
  }

  // إظهار كل الـ permissions المحددة للأب
  emitSelectedPermissions() {
    const allSelectedIds = this.permissionSectionsDetails()
      .flatMap((section) => section.roleModulesItems || [])
      .filter((p) => p.isSelected)
      .map((p) => p.id);

    this.onCheck.emit(allSelectedIds);
  }

  // عند البحث
  onSearch(searchValue: string): void {
    this.search.emit(searchValue);
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }
}
