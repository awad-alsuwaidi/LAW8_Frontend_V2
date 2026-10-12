import { CommonModule, JsonPipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ChipModule } from 'primeng/chip';
import { generateHexColorFromString } from 'src/app/@core/utilities/functions/color-from-string';
import { lightenColor } from 'src/app/@core/utilities/functions/lighten-color';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';

@Component({
  selector: 'app-calender-filter-chips',
  standalone: true,
  imports: [
    ChipModule,
    SharedButtonComponent,
    NgClass,
    JsonPipe,
    TranslateModule,
    CommonModule,
  ],
  templateUrl: './calender-filter-chips.component.html',
  styleUrl: './calender-filter-chips.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalenderFilterChipsComponent {
  @Input() filter: any;
  @Input() coloredKey!: string;

  @Input() usersLookup: any[] = [];
  @Input() activityLookup: any[] = [];
  @Input() currentUserId?: string;

  @Output() onFilterUpdate: EventEmitter<any> = new EventEmitter<any>();
  cdRef = inject(ChangeDetectorRef);

  private getLabel(key: string, value: any): string {
    if (key === 'user') {
      return this.usersLookup.find((u: any) => u.id === value)?.name ?? String(value);
    }
    if (key === 'activity') {
      return this.activityLookup.find((a: any) => a.id === value)?.name ?? String(value);
    }
    return String(value);
  }

  getFilterItems(key: string) {
    const value = this.filter[key];

    if (Array.isArray(value)) {
      if (value.length && (typeof value[0] === 'string' || typeof value[0] === 'number')) {
        return value.map((v: any) => ({ label: this.getLabel(key, v), value: v }));
      }
      return value;
    }

    if (typeof value === 'object' && value.label) return [value];
    if (typeof value === 'string') return [{ label: value, value }];

    return [];
  }

 updateFilter(key: string, itemToRemove: any) {
  const value = this.filter[key];

  if (Array.isArray(value)) {
    if (value.length && (typeof value[0] === 'string' || typeof value[0] === 'number')) {
      this.filter[key] = value.filter((v: any) => v !== itemToRemove.value);
    } 
    else {
      this.filter[key] = value.filter((it: any) => it.value !== itemToRemove.value);
    }

    if (this.filter[key].length === 0) {
      this.filter[key] = [];
    }
  } 
  else {
    this.filter[key] = [];
  }

  this.cdRef.detectChanges();

  this.onFilterUpdate.emit({ ...this.filter });
}


  generateHexColor(userId: string) {
    if (this.currentUserId && userId === this.currentUserId) return '#1E43D7';
    return generateHexColorFromString(userId);
  }

  generateLightenColor(color: string) {
    return lightenColor(color);
  }

reset() {
  this.onFilterUpdate.emit({
    user: [],
    activity: [],
  });
}


  get filterKeys() {
  if (!this.filter) return [];

  return Object.keys(this.filter).filter((key) => {
    if (key === 'search') return false;

    const value = this.filter[key];
    if (!value) return false;

    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return true;
    if (typeof value === 'string') return value.trim() !== '';

    return false;
  });
}

}

