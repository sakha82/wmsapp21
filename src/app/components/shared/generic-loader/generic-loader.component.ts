import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-generic-loader',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  templateUrl: './generic-loader.component.html'
})
export class GenericLoaderComponent {
  @Input() visible = false;
}
