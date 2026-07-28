import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SharedService } from 'app/services/shared.service';

/**
 * Text-only AI-assist entry point: "describe what you want, AI suggests field
 * values." No microphone/speech capability — per product decision, voice
 * input only happens through the external WhatsApp/Telegram bot, never
 * inside the app itself.
 *
 * This component only captures and emits the typed text — it doesn't call
 * any API or know what "work order" or any other domain object is, so it can
 * be reused by future modules the same way.
 */
@Component({
  selector: 'app-ai-assist-input',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule],
  templateUrl: './ai-assist-input.component.html',
})
export class AiAssistInputComponent {
  @Input() placeholder = '';
  @Input() loading = false;
  @Output() submitText = new EventEmitter<string>();

  text = '';

  constructor(public readonly sharedService: SharedService) {}

  submit(): void {
    const value = this.text.trim();
    if (!value || this.loading) {
      return;
    }
    this.submitText.emit(value);
  }
}
