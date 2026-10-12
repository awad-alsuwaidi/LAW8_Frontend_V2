import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-shared-status',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './shared-status.component.html',
  styleUrl: './shared-status.component.scss'
})
export class SharedStatusComponent {
  @Input() statusConfig:any;
  @Input() data:any;
  @Input() label?:string;
}
