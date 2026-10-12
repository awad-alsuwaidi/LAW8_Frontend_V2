import { Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-client-skeleton',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: './client-skeleton.component.html',
  styleUrl: './client-skeleton.component.scss'
})
export class ClientSkeletonComponent {

}
