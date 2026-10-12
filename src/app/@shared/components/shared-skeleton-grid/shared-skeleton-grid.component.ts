import { Component, input, InputSignal } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-shared-skeleton-grid',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: './shared-skeleton-grid.component.html',
  styleUrl: './shared-skeleton-grid.component.scss'
})
export class SharedSkeletonGridComponent {
  styleClass: InputSignal<string> = input<string>('');
  styleClassSkeleton: InputSignal<string> = input<string>('');
  size: InputSignal<number> = input<number>(6);

}
