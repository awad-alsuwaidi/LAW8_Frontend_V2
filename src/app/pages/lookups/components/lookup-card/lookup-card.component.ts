import { Component, input, InputSignal } from '@angular/core';
import { LookupConfig } from '../../interface/lookup.interface';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-lookup-card',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './lookup-card.component.html',
  styleUrl: './lookup-card.component.scss'
})
export class LookupCardComponent {
  data: InputSignal<LookupConfig|undefined> = input<LookupConfig|undefined>()
}
