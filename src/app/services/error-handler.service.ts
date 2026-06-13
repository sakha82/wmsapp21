import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { LogService } from './log.service';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(
    private readonly logger: LogService,
    private readonly sharedService: SharedService,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  /**
   * Handle errors from subscriptions with dev/prod differentiation
   * In production: Shows user-friendly message, logs only the message
   * In development: Shows full error details, logs error object with context
   *
   * @param error - The error object from the subscription
   * @param methodName - The name of the method where the error occurred
   * @param userMessage - User-friendly message to display to user (default: generic message)
   * @param context - Optional additional context information for logging in dev mode
   */
  handleError(
    error: any,
    methodName: string,
    userMessage: string = this.sharedService.T('genericErrorContactSupport'),
    context?: any
  ): void {
    const logMessage = `[${methodName}] ${userMessage}`;

    if (environment.production) {
      this.logger.error(logMessage);
    } else {
      const errorDetails: Record<string, unknown> = {
        error,
        context,
        timestamp: new Date().toISOString(),
      };

      if (isPlatformBrowser(this.platformId)) {
        errorDetails['userAgent'] = navigator.userAgent;
      }

      this.logger.error(logMessage, errorDetails);
      console.error(`🔴 ${logMessage}`, error, context);
    }
  }

  /**
   * Get user-friendly error message for UI display
   * In production: Returns generic, sanitized message
   * In development: Returns detailed error information for debugging
   *
   * @param error - The error object
   * @param defaultMessage - Default user-friendly message
   * @returns Appropriate message based on environment
   */
  getUserMessage(
    error: any,
    defaultMessage: string = this.sharedService.T('genericErrorContactSupport'),
  ): string {
    if (environment.production) {
      return defaultMessage;
    }

    const errorDetails = error?.message || error?.statusText || error?.error?.message || 'Unknown error';
    return `${defaultMessage} - [${errorDetails}]`;
  }

  /**
   * Alternative: Handle error and return the message (useful for toast notifications)
   * Combines logging and message generation in one call
   */
  handleErrorWithMessage(
    error: any,
    methodName: string,
    userMessage: string = this.sharedService.T('genericErrorContactSupport'),
    context?: any
  ): string {
    this.handleError(error, methodName, userMessage, context);
    return this.getUserMessage(error, userMessage);
  }
}
