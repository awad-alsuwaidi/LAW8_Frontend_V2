import { Component, inject } from '@angular/core';
import { SharedButtonComponent } from '../shared-button/shared-button.component';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NgClass } from '@angular/common';        
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';

@Component({
  selector: 'app-shared-confirm-dialog',
  standalone: true,
  imports: [
    SharedButtonComponent,
    NgClass
  ],
  templateUrl: './shared-confirm-dialog.component.html',
  styleUrl: './shared-confirm-dialog.component.scss'
})
export class SharedConfirmDialogComponent {
  _dynamicDialogConfig=inject(DynamicDialogConfig);
  _dynamicDialogRef=inject(DynamicDialogRef);
  ConfirmDialogType=  ConfirmDialogType; 
   
}
