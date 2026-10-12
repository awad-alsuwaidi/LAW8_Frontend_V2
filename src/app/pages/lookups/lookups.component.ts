import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from 'src/app/@core/services';
import { PermissionService } from 'src/app/@core/services/permission.service';
import { SharedModule } from 'src/app/@shared/shared.module';
import { LookupCardComponent } from './components/lookup-card/lookup-card.component';
import { LookupConfig } from './interface/lookup.interface';
import { getLookupCards } from './lookup-list-config';

@Component({
  selector: 'app-lookups',
  standalone: true,
  imports: [SharedModule, LookupCardComponent],
  templateUrl: './lookups.component.html',
  styleUrl: './lookups.component.scss',
})
export class LookupsComponent implements OnInit {
  _router = inject(Router);
  _languageService = inject(LanguageService);
  _permissionService = inject(PermissionService); // ★

  lookups: LookupConfig[] = [];

  ngOnInit(): void {
    this.lookups = getLookupCards(this).filter((card) =>
      this.canSeeCard(card)
    );
  }

  /** ★ بيحدد لو الكارت يظهر */
  private canSeeCard(card: LookupConfig): boolean {
    // لو فيه anyOfRouteNames
    if (card.anyOfRouteNames?.length) {
      return card.anyOfRouteNames.some((c) =>
        this._permissionService.hasPermission(c.routeName, c.action ?? 'canRead')
      );
    }
    // الشكل العادي
    return this._permissionService.hasPermission(
      card.routeName,
      card.action ?? 'canRead'
    );
  }
}