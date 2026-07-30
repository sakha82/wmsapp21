import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SharedService } from 'app/services/shared.service';
import { VoiceInputButtonComponent } from 'app/components/shared/voice-input-button/voice-input-button.component';

/**
 * AI-assist entry point: "describe what you want, AI suggests field values" —
 * typed or spoken. Recording/transcription is delegated to
 * VoiceInputButtonComponent; a returned transcript fills the input and
 * submits immediately, same as pressing Enter after typing.
 *
 * This component only captures and emits the resulting text — it doesn't
 * call the parsing API or know what "work order" or any other domain object
 * is, so it can be reused by future modules the same way.
 */
@Component({
  selector: 'app-ai-assist-input',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, VoiceInputButtonComponent],
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

  onVoiceTranscribed(transcript: string): void {
    this.text = transcript;
    this.submit();
  }
}
