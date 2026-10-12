import {
  Component,
  input,
  InputSignal,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { SecurityGroupEditorPermissionsComponent } from './components/security-group-editor-permissions/security-group-editor-permissions.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { SharedModule } from 'src/app/@shared/shared.module';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { finalize } from 'rxjs';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { SharedSearchComponent } from 'src/app/@shared/components/shared-search/shared-search.component';
@Component({
  selector: 'app-security-groups-editor',
  standalone: true,
  imports: [
    SecurityGroupEditorPermissionsComponent,
    SharedModule,
    FormlyConfigModule,
    SharedButtonComponent,
    BreadcrumbModule,
    SharedSearchComponent,
  ],
  templateUrl: './security-groups-editor.component.html',
  styleUrl: './security-groups-editor.component.scss',
})
export class SecurityGroupsEditorComponent
  extends FormBaseClass
  implements OnInit, OnDestroy
{
  permissionSections: any[] = [];
  permissionSectionsDetails: any[] = [];
  selectedPermissionIds: string[] = [];
  items: MenuItem[] | undefined;
  filterOptions: any;

  groupIdentifier: InputSignal<string | undefined> = input<
    string | undefined
  >();
  selectedItem: any;
  ngOnInit(): void {
    this.items = [
      {
        label: this._languageService.getTransValue('Groups'),
        routerLink: '/security/groups',
      },
      {
        label: this._languageService.getTransValue(
          this.groupIdentifier() ? 'Update' : 'Add'
        ),
      },
    ];
    this.getPermissionsMenu();
  }
  getPermissionsMenu() {
    this._apiService
      .get(API_Config.groupSecurity.getPermissionMenu, this.filterOptions)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this.permissionSections = res.result;
            this.initForm();
          }
        },
      });
  }
  override initForm(): void {
    this.formlyFields = [
      {
        fieldGroupClassName: 'grid md:grid-cols-3 gap-4',
        fieldGroup: [
          {
            key: 'name',
            type: 'input',
            props: {
              label: 'Group Name',
              required: true,
            },
          },
          {
            key: 'foreignName',
            type: 'input',
            props: {
              label: 'Foreign Name',
              required: true,
            },
          },
        ],
      },
    ];
    this.setFormData();
  }
  selectedPermissionsMap: Record<number, string[]> = {};

  onSearch(searchValue: string): void {
    this.filterOptions = { search: searchValue };
    this.getPermissionsMenu();
  }

  override onSubmit(): void {
    if (this.formly.invalid) {
      this.formly.markAllAsTouched();
      return;
    }

    this.isSubmitted = true;

    const allPermissions = Object.values(this.selectedPermissionsMap).flat();

    const payload = {
      name: this.formlyModel.name,
      foreignName: this.formlyModel.foreignName,
      rolesItms: allPermissions,
    };

    const apiEndpoint = this.groupIdentifier()
      ? API_Config.groupSecurity.update
      : API_Config.groupSecurity.create;

    const finalPayload = this.groupIdentifier()
      ? { ...payload, id: this.groupIdentifier() }
      : payload;

    this._apiService
      .post(apiEndpoint, finalPayload)
      .pipe(
        finalize(() => (this.isSubmitted = false)),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res) => {
          if (res?.isSuccess) {
            this._toastrNotifiService.displaySuccess(res.message);
            this.refreshSelectedPermissions();
          }
        },
        error: (err) => {
          console.error('API error:', err);
        },
      });
  }

  getMenuDetailedPermissions(ParentId: number) {
    this.selectedItem = this.permissionSections.find((i) => i.id === ParentId);

    const param = { ParentId, RoleId: this.groupIdentifier() };
    const apiEndpoint = this.groupIdentifier()
      ? API_Config.groupSecurity.getPermissionMenuMenuDetails
      : API_Config.groupSecurity.createPermissionMenuMenuDetails;

    this._apiService
      .get(apiEndpoint, param)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            const savedSelections =
              this.selectedPermissionsMap[ParentId] ??
              res.result.flatMap((section: any) =>
                section.roleModulesItems
                  .filter((item: any) => item.isSelected)
                  .map((i: any) => i.id)
              );

            this.selectedPermissionsMap[ParentId] = savedSelections;

            this.permissionSectionsDetails = res.result.map((section: any) => ({
              ...section,
              roleModulesItems: section.roleModulesItems.map((item: any) => ({
                ...item,
                isSelected: this.selectedPermissionsMap[ParentId].includes(
                  item.id
                ),
              })),
            }));

            this.selectedPermissionIds = [
              ...this.selectedPermissionsMap[ParentId],
            ];
          }
        },
      });
  }
  setFormData(): void {
    if (!this.groupIdentifier()) return;
    const param = { RoleId: this.groupIdentifier() };

    this._apiService
      .get(API_Config.groupSecurity.getById, param)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this.formlyModel = { ...res.result };
            this.permissionSections = res.result.roleMenuWithCount || [];

            this.permissionSections.forEach((section: any) => {
              this.selectedPermissionsMap[section.id] =
                section.itemsSelected || [];
            });

            if (this.permissionSections.length) {
              const firstSectionId = this.permissionSections[0].id;
              this.getMenuDetailedPermissions(firstSectionId);
            }
          }
        },
      });
  }
  getCheckedPermissions(permissionIds: string[]) {
    if (!this.selectedItem?.id) return;

    this.selectedPermissionsMap[this.selectedItem.id] = [...permissionIds];

    const section = this.permissionSections.find(
      (s) => s.id === this.selectedItem.id
    );
    if (section) {
      section.roleModulesItems.forEach(
        (item: { isSelected: boolean; id: string }) => {
          item.isSelected = this.selectedPermissionsMap[
            this.selectedItem.id
          ].includes(item.id);
        }
      );
    }
  }

  refreshSelectedPermissions() {
    if (!this.groupIdentifier()) return;

    const param = { RoleId: this.groupIdentifier() };
    this._apiService
      .get(API_Config.groupSecurity.getById, param)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this.permissionSections = res.result.roleMenuWithCount || [];
            this.permissionSections.forEach((section: any) => {
              this.selectedPermissionsMap[section.id] =
                section.itemsSelected || [];
            });

            if (this.selectedItem?.id) {
              const selectedId = this.selectedItem.id;
              this.permissionSectionsDetails =
                this.permissionSectionsDetails.map((section: any) => ({
                  ...section,
                  roleModulesItems: section.roleModulesItems.map(
                    (item: any) => ({
                      ...item,
                      isSelected:
                        this.selectedPermissionsMap[selectedId]?.includes(
                          item.id
                        ) || false,
                    })
                  ),
                }));

              this.selectedPermissionIds = [
                ...this.selectedPermissionsMap[selectedId],
              ];
            }
          }
        },
      });
  }

  cancel() {
    this._router.navigate(['/security/groups']);
  }
  goBack(): void {
    this._router.navigate(['/security/groups']);
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
