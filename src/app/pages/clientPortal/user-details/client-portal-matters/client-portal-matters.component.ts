import { Component } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { SharedModule } from 'src/app/@shared/shared.module';
import { SecurityMatterFilterComponent } from '../components/security-matter-filter/security-matter-filter.component';
import { SecurityMatterIncludeComponent } from './security-matter-include/security-matter-include.component';

@Component({
  selector: 'app-client-portal-matters',
  standalone: true,
  imports: [
    SharedModule,
    SecurityMatterFilterComponent,
    AccordionModule,
    SecurityMatterIncludeComponent
  ],
  templateUrl: './client-portal-matters.component.html',
  styleUrl: './client-portal-matters.component.scss'
})
export class ClientPortalMattersComponent {
  protected userId!: string;
  onFilter(e: any) {
    this.userId = e.userId;
  }
}
