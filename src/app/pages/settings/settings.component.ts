import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    TranslateModule,
    SharedButtonComponent,
    RouterModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  menu: any[] = [
    {
      label: 'SAP Integration',
      routerLink: './general'
    },
     {
      label: 'Taxes',
      routerLink: './taxes'
    },
    {
      label: 'System Currency',
      routerLink: './system-currency'
    },
    {
      label: 'Company Logo',
      routerLink: './company-logo'
    },
   
  ]
}
