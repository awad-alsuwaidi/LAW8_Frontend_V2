import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PermissionDirective } from '../@core/directives/permission.directive';

const components: any = [];

const modules = [
  CommonModule,
  TranslateModule,
  RouterModule,
  DialogModule,
  PermissionDirective,
];

@NgModule({
  declarations: [...components],
  imports: [...modules],
  exports: [...components, ...modules],
  providers: [DynamicDialogConfig, DynamicDialogRef],
})
export class SharedModule {}
