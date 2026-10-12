import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ApiService } from 'src/app/@core/api/api.service';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';

@Component({
  selector: 'app-recreate-bill-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    ButtonModule,
  ],
  template: `
   <div class="flex flex-col h-full p-6">

  <div class="flex-1 flex flex-col gap-4">
    <p-dropdown
      [options]="templates"
      optionLabel="name"
      optionValue="id"
      [(ngModel)]="selectedTemplateId"
      placeholder="Select Template"
      class="w-full"
      [style]="{ height: '44px' }"
    ></p-dropdown>
  </div>

  <div class="flex justify-end gap-2 pt-4 border-t">
    <button
      pButton
      label="Cancel"
      class="p-button-text"
      (click)="cancel()"
    ></button>

    <button
      pButton
      label="Recreate"
      class="p-button-primary"
      [disabled]="!selectedTemplateId"
      (click)="submit()"
    ></button>
  </div>
</div>
  `,
})
export class RecreateBillDialogComponent implements OnInit {
  private _apiService = inject(ApiService);
  ref = inject(DynamicDialogRef);
  config = inject(DynamicDialogConfig);

  templates: any[] = [];
  selectedTemplateId: number | null = null;

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates() {
    this._apiService
      .get(API_Config.general.getBillingTempletsList)
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this.templates = res.result;
          }
        },
      });
  }

  submit() {
    this.ref.close(this.selectedTemplateId);
  }

  cancel() {
    this.ref.close();
  }
}
