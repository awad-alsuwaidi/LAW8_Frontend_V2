import { Component } from '@angular/core';
import { SharedModule } from 'src/app/@shared/shared.module';
import { SecurityMatterFilterComponent } from './components/security-matter-filter/security-matter-filter.component';
import { SecurityMatterClientsComponent } from './components/security-matter-clients/security-matter-clients.component';
import { AccordionModule } from 'primeng/accordion';
import { SecurityMatterResponsableLawyersComponent } from './components/security-matter-responsable-lawyers/security-matter-responsable-lawyers.component';
import { SecurityMatterJurisdictionComponent } from './components/security-matter-jurisdiction/security-matter-jurisdiction.component';
import { SecurityMatterIncludeComponent } from './components/security-matter-include/security-matter-include.component';
import { SecurityMatterExcludeComponent } from './components/security-matter-exclude/security-matter-exclude.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-security-matter',
  standalone: true,
  imports: [
    SharedModule,
    SecurityMatterFilterComponent,
    AccordionModule,
    SecurityMatterClientsComponent,
    SecurityMatterResponsableLawyersComponent,
    SecurityMatterJurisdictionComponent,
    SecurityMatterIncludeComponent,
    SecurityMatterExcludeComponent
  ],
  templateUrl: './security-matter.component.html',
  styleUrl: './security-matter.component.scss'
})
export class SecurityMatterComponent {
  isInhouse = environment.brand === 'inhouse';

  protected userId!:string;
  onFilter(e: any) {
    this.userId = e.userId;
  }
}
