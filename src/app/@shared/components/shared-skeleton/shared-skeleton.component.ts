import { Component, Input } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-shared-skeleton',
  standalone: true,
  imports: [
    SkeletonModule
  ],
  templateUrl: './shared-skeleton.component.html',
  styleUrl: './shared-skeleton.component.scss'
})
export class SharedSkeletonComponent {
  @Input() count!:number;
}
