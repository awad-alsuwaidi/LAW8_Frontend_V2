import { Component, Input } from '@angular/core';
import { SharedButtonComponent } from '../shared-button/shared-button.component';
import { EmptyConfig } from './interface/empty-config.interface';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-shared-empty-section',
  standalone: true,
  imports: [
    SharedButtonComponent,
    SharedModule
  ],
  templateUrl: './shared-empty-section.component.html',
  styleUrl: './shared-empty-section.component.scss'
})
export class SharedEmptySectionComponent {
  @Input({required:true}) emptyConfig?:EmptyConfig;
  @Input() withImage:boolean=true;
  @Input() styleClass!:string
}
