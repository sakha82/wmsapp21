import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs';
import { CoreService } from 'app/services/core.service';
import { ErrorHandlerService } from 'app/services/error-handler.service';
import { LogService } from 'app/services/log.service';
import { SharedService } from 'app/services/shared.service';

/**
 * Record-and-transcribe mic button, reused across the AI-assist input, the
 * work order description field, and the reminders quick-capture row.
 * Records via the browser's MediaRecorder API, uploads the clip to
 * CoreService.transcribeAudio() (wms-api -> wms-ai -> OpenAI), and emits the
 * returned text. Hides itself entirely when the browser doesn't support
 * MediaRecorder/getUserMedia — no broken button, no error state for that case.
 */
@Component({
  selector: 'app-voice-input-button',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule],
  templateUrl: './voice-input-button.component.html',
})
export class VoiceInputButtonComponent {
  @Output() transcribed = new EventEmitter<string>();

  readonly isSupported = typeof navigator !== 'undefined' && !!navigator.mediaDevices && typeof (window as any).MediaRecorder !== 'undefined';

  recording = false;
  transcribing = false;

  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;

  constructor(
    private readonly coreService: CoreService,
    private readonly messageService: MessageService,
    private readonly errorHandler: ErrorHandlerService,
    private readonly logger: LogService,
    public readonly sharedService: SharedService
  ) {}

  async toggle(): Promise<void> {
    if (this.transcribing) {
      return;
    }
    if (this.recording) {
      this.mediaRecorder?.stop();
      return;
    }
    await this.startRecording();
  }

  private async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      this.errorHandler.handleError(error, 'VoiceInputButtonComponent.startRecording', this.sharedService.T('micPermissionDenied'));
      this.messageService.add({ severity: 'error', summary: this.sharedService.T('error'), detail: this.sharedService.T('micPermissionDenied'), life: 4000 });
      return;
    }

    this.chunks = [];
    this.mediaRecorder = new MediaRecorder(this.stream);
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };
    this.mediaRecorder.onstop = () => this.onRecordingStopped();
    this.mediaRecorder.start();
    this.recording = true;
  }

  private onRecordingStopped(): void {
    this.recording = false;
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;

    const blob = new Blob(this.chunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' });
    this.chunks = [];
    if (blob.size === 0) {
      return;
    }

    this.transcribing = true;
    this.coreService.transcribeAudio(blob)
      .pipe(finalize(() => { this.transcribing = false; }))
      .subscribe({
        next: (result) => {
          if (result.text?.trim()) {
            this.transcribed.emit(result.text.trim());
          }
        },
        error: (error) => {
          this.logger.error('transcribeAudio error', error);
          this.messageService.add({ severity: 'error', summary: this.sharedService.T('error'), detail: this.sharedService.T('voiceTranscriptionFailed'), life: 4000 });
        },
      });
  }
}
