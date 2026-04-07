import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedService } from 'app/services/shared.service';
import { LogService } from 'app/services/log.service';
import { finalize, takeUntil, Subject } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';


@Component({
  selector: 'forgetpassword-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    MessageModule
  ],
  providers: [],
  templateUrl: './forgetpassword-view.component.html',

})
export class ForgetPasswordViewComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  forgotPasswordForm: FormGroup;
  successMessage: string | null = null;
  isLoading: boolean = false;
  imagesUrl = 'assets/images/';

  constructor(    
      private readonly fb: FormBuilder,
      private router: Router,
      private readonly route: ActivatedRoute,
      private logger: LogService,
      private readonly sharedService: SharedService,
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }
  ngOnInit(): void {
 }

  onForgotPasswordSubmitted() {
    this.forgotPasswordForm.markAllAsTouched();
    
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.isLoading = true;
    const email = this.forgotPasswordForm.get('email')?.value;
    this.logger.info('Sending reset link to:', email);

    this.sharedService
      .forgotPassword(this.forgotPasswordForm.value)
      .pipe(
        finalize(() => { this.isLoading = false; }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          if (res) {
            this.successMessage = 'En återställningslänk har skickats till din e-postadress. Kontrollera din inkorg.';
            this.forgotPasswordForm.reset();
          }
        },
        error: (error) => {
          this.logger.error('Error forgot password:', error);
          this.successMessage = null;
        }
      });
  }

  navigateToLogin(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.logger.info('Navigating to login page');
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}