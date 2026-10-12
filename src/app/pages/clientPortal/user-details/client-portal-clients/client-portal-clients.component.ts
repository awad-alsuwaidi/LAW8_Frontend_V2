import { Component } from '@angular/core';
import { SecurityMatterFilterComponent } from '../components/security-matter-filter/security-matter-filter.component';
import { AccordionModule } from 'primeng/accordion';
import { SecurityMatterClientsComponent } from './security-matter-clients/security-matter-clients.component';
import { SharedModule } from 'src/app/@shared/shared.module';

@Component({
  selector: 'app-client-portal-clients',
  standalone: true,
  imports: [
    SharedModule,
    SecurityMatterFilterComponent,
    AccordionModule,
    SecurityMatterClientsComponent,
  ],
  templateUrl: './client-portal-clients.component.html',
  styleUrl: './client-portal-clients.component.scss'
})
export class ClientPortalClientsComponent {
  protected userId!: string;
  onFilter(e: any) {
    this.userId = e.userId;
  }
}
