import { Component } from '@angular/core';
import { FieldArrayType } from '@ngx-formly/core';

@Component({
  selector: 'formly-repeat-alloc-section',
  template: `
    <div class="space-y-3">

      <!-- Header -->
      <div class="hidden md:grid md:grid-cols-12 gap-4 px-3 text-xs text-grey400">
        <div class="md:col-span-6">Matter</div>
        <div class="md:col-span-2">Amount</div>
        <div class="md:col-span-2">New Balance</div>
        <div class="md:col-span-2 text-right">Action</div>
      </div>

      <!-- Rows -->
      <ng-container *ngFor="let row of field.fieldGroup; let i = index">
        <div class="grid grid-cols-12 gap-4 items-end p-4 rounded-2xl border border-grey200 bg-white">

          <!-- Matter -->
          <ng-container *ngFor="let f2 of row.fieldGroup">
            <ng-container *ngIf="f2.key === 'matterId'">
              <div class="col-span-12 md:col-span-6">
                <formly-field [field]="f2"></formly-field>
              </div>
            </ng-container>
          </ng-container>

          <!-- Amount -->
          <ng-container *ngFor="let f2 of row.fieldGroup">
            <ng-container *ngIf="f2.key === 'amount'">
              <div class="col-span-12 md:col-span-2">
                <formly-field [field]="f2"></formly-field>
              </div>
            </ng-container>
          </ng-container>

          <!-- New Balance -->
          <ng-container *ngFor="let f2 of row.fieldGroup">
            <ng-container *ngIf="f2.key === 'newBalance'">
              <div class="col-span-12 md:col-span-2">
                <formly-field [field]="f2"></formly-field>
              </div>
            </ng-container>
          </ng-container>

          <!-- Action / Remove -->
          <div class="col-span-12 md:col-span-2 flex md:justify-end">
         <button
  type="button"
  class="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium
         bg-red-600 hover:bg-red-700 text-white disabled:bg-transparent disabled:opacity-50"
  [disabled]="field.fieldGroup?.length === 1"
  (click)="remove(i)">
  {{ to['removeText'] || 'Remove' }}
</button>

          </div>
        </div>
      </ng-container>

      <!-- Add -->
      <div>
        <button
          type="button"
          class="bg-primary text-white px-4 py-2 rounded-lg text-sm"
          (click)="add()">
          {{ to['addText'] || '+ Add Matter Allocation' }}
        </button>
      </div>

    </div>
  `,
})
export class RepeatAllocTypeComponent extends FieldArrayType {}
