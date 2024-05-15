import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-slider-and-text',
  standalone: true,
  imports: [],
  templateUrl: './slider-and-text.component.html',
  styleUrl: './slider-and-text.component.scss'
})
export class SliderAndTextComponent {
  @Input() function: string | undefined
}
