import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { ChipModule } from 'primeng/chip';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';

@Component({
  selector: 'app-calender-filter-chips',
  standalone: true,
  imports: [ChipModule, SharedButtonComponent],
  templateUrl: './calender-filter-chips.component.html',
  styleUrl: './calender-filter-chips.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalenderFilterChipsComponent {
  @Input() filter: any;
  @Output() onFilterUpdate: EventEmitter<any> = new EventEmitter<any>();

  cdRef = inject(ChangeDetectorRef);

  get filterKeys() {
    return Object.keys(this.filter).filter(
      (key) => this.filter[key] && this.filter[key].length > 0
    );
  }
  updateFilter(key: string, itemToRemove: any) {
    this.filter[key] = this.filter[key].filter(
      (item: any) => item.label !== itemToRemove.label
    );
    this.cdRef.detectChanges();
    if (this.filter[key].length === 0) {
      delete this.filter[key];
    } else if (Object.keys(this.filter).length === 0) {
      this.filter = null;
    }
    console.log(this.filter);
    this.onFilterUpdate.emit(this.filter);
  }
  reset() {
    this.filter = {};
    this.onFilterUpdate.emit(this.filter);
  }
}
