import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LogService } from 'app/services/log.service';
import { SharedService } from 'app/services/shared.service';
import { WmsUser } from 'app/app.model';
import { MessageService } from 'primeng/api';
import { environment } from 'environments/environment';
import { finalize, takeUntil, Subject } from "rxjs";
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface FaqItem {
  question: string;
  answer: string;
  expanded: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    ToastModule,
    MessageModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [MessageService]
})


export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private baseUrl: string = environment.BASE_URL;
  loginForm!: FormGroup;
  signupForm!: FormGroup;
  demoForm!: FormGroup;
  invalidMessage: string = '';
  isDialogVisible: boolean = false;
  isLoading: boolean = false; // Loader control variable
  imagesUrl = 'assets/images/';
  
  
  mobileMenuOpen = false;
  isSigningUp: boolean = false;
  signupSuccess: boolean = false;
  isDemoModalVisible: boolean = false;
  isDemoSubmitting: boolean = false;
  demoSuccess: boolean = false;

  features: Feature[] = [
    {
      icon: 'group',
      title: 'Kundregister',
      description: 'Samla all kundinformation på ett ställe med kundspecifika inställningar. Tagga dina kunder, skapa smart segmentering och få full kontroll över din kundöversikt.'
    },
    {
      icon: 'assignment_turned_in',
      title: 'Skapa Offerter',
      description: 'Skapa en offert på några minuter och skicka den smidigt via e-post eller WhatsApp med ett klick! När kunden godkänner kan du enkelt konvertera offerten till en arbetsorder eller faktura.'
    },
    {
      icon: 'engineering',
      title: 'Arbetsorder',
      description: 'Skapa och följ upp arbetsorder på sekunder – smidigt, snabbt och anpassat för din verkstad! Effektivisera din arbetsdag med smarta funktioner som gör det enkelt att hantera jobb, resurser och uppföljning i realtid.'
    },
    {
      icon: 'request_quote',
      title: 'Fakturering',
      description: 'Skapa professionella fakturor direkt från arbetsorder eller offerter. Integrering med ekonomisystem gör fakturering enkel och effektiv. Automatiska påminnelser hjälper dig att få betalt i tid.'
    },
    {
      icon: 'calendar_today',
      title: 'Schemaläggning',
      description: 'Hantera bokningar och resurser smidigt i kalendern. Se direkt när bilar, verktyg och personal är tillgängliga och planera arbetsdagen utan stress.'
    },
    {
      icon: 'book',
      title: 'Digital Servicebok',
      description: 'Ge dina kunder full transparens med en digital servicebok för varje fordon. All servicehistorik, utförda arbeten och bilder samlas på ett ställe och är lättåtkomlig för både dig och kunden.'
    },
    {
      icon: 'person',
      title: 'Antsällningsregister',
      description: 'Samla all information om dina anställda på ett ställe. Hantera anställningsuppgifter, roller och kontaktinformation, och få en tydlig överblick över personalen för enklare administration och bättre kontroll.'
    },
    {
      icon: 'person',
      title: 'Personalliggare',
      description: 'Håll koll på anställdas arbetstider enkelt och korrekt. Registrera när personal checkar in och ut, få överblick i realtid och säkerställ att allt följer regler och krav utan krångel.'
    }
  ];

  faqItems: FaqItem[] = [
    {
      question: 'Vad ingår i priset på 199 kr/månad?',
      answer: `För 199 kr per användare och månad får du tillgång till alla funktioner i Digital Workshop – kundregister, offerthantering, arbetsorder, digital servicebok, schemaläggning, rapporter, statistik och vår AI Assistant.
               I abonnemanget ingår dessutom 5 digitala serviceposter utan extra kostnad varje månad, så att du enkelt kan komma igång och visa värdet för dina kunder.
               När du behöver registrera fler serviceposter kan du göra det flexibelt till en låg kostnad på endast 5 kr per extra digital servicepost.
               Detta ger dig full kontroll över dina kostnader samtidigt som du kan växa i din egen takt och endast betala för det du faktiskt använder.`,
      expanded: false
    },
    {
      question: 'Vad är Digital Servicebok?',
      answer: `Genom att erbjuda en digital servicebok ger du dina kunder en tydlig och professionell översikt över allt arbete som utförts på deras fordon. Detta ökar förtroendet och stärker relationen mellan dig och dina kunder.
               Systemet hjälper dig även att skapa bättre uppföljning, eftersom du enkelt kan se tidigare arbeten och planera framtida service. Det blir lättare att ge rätt rekommendationer och erbjuda proaktiv service.
               Med en digital servicebok differentierar du din verkstad från konkurrenter och visar att du arbetar modernt och digitalt. Samtidigt bidrar det till ökad kundlojalitet och fler återkommande besök.`,
      expanded: false
    },
    {
      question: 'Får jag tillgång till nya uppdateringar inom samma pris?',
      answer: `Ja, absolut. Vi utvecklar kontinuerligt Digital Workshop och lanserar nya funktioner varje månad – utan extra kostnad för dig. Alla förbättringar och nya funktioner ingår i din befintliga prenumeration.
                Vi arbetar nära våra kunder och lyssnar aktivt på feedback och önskemål. Många av våra nya funktioner utvecklas direkt baserat på användarnas behov, vilket innebär att du som kund är med och påverkar produktens framtid.`,
      expanded: false
    },
    {
      question: 'Kan systemet integreras med mitt bokföringsprogram?',
      answer: `För närvarande erbjuder vi inga färdiga integrationer med bokföringsprogram. Däremot utvecklar vi kontinuerligt nya funktioner baserat på våra kunders behov. Om det finns efterfrågan på integration med ditt bokföringsprogram prioriterar vi detta och arbetar för att kunna lansera det redan i kommande uppdateringar.`,
      expanded: false
    }
  ];

  constructor(
    private logger: LogService,
    private http: HttpClient,
    private readonly formBuilder: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      "email": ['', [Validators.required, Validators.email]],
      "password": ['', [Validators.required, Validators.minLength(6)]]
    });

    this.signupForm = this.formBuilder.group({
      "companyName": ['', Validators.required],
      "organizationNumber": ['', Validators.required],
      "contactPerson": ['', Validators.required],
      "phoneNumber": ['', Validators.required],
      "email": ['', [Validators.required, Validators.email]],
      "password": ['', [Validators.required, Validators.minLength(6)]],
      "acceptTerms": [false, Validators.requiredTrue]
    });

    this.demoForm = this.formBuilder.group({
      "name": ['', Validators.required],
      "companyName": ['', Validators.required],
      "email": ['', [Validators.required, Validators.email]],
      "phoneNumber": ['', Validators.required]
    });
    
    // Ensure forms are in clean state after initialization
    this.loginForm.reset();
    this.signupForm.reset();
    this.demoForm.reset();
  }

  toggleFaq(index: number): void {
    // Close all other FAQs
    this.faqItems.forEach((item, i) => {
      if (i !== index) {
        item.expanded = false;
      }
    });

    // Toggle current FAQ
    this.faqItems[index].expanded = !this.faqItems[index].expanded;
  }
  show() {
    this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Message Content', life: 3000 });
  }

  openTermsModal(event: Event) {
    event.preventDefault();
    // Scroll to terms section or open a full-screen modal
    const termsModal = document.getElementById('termsModal');
    if (termsModal) {
      (termsModal as any).style.display = 'block';
    }
  }

  closeTermsModal() {
    const termsModal = document.getElementById('termsModal');
    if (termsModal) {
      (termsModal as any).style.display = 'none';
    }
  }

  acceptTermsFromModal() {
    this.signupForm.patchValue({ acceptTerms: true });
    this.closeTermsModal();
  }

  onLoginFormSubmitted() {
    this.loginForm.markAllAsTouched();
    
    if (this.loginForm.invalid) {
      this.invalidMessage = 'Vänligen fyll alla obligatoriska fält.';
      return;
    }

    this.isLoading = true;
    this.invalidMessage = '';

    this.sharedService
      .login(this.loginForm.value as WmsUser)
      .pipe(
        finalize(() => { this.isLoading = false; }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          this.logger.info(res);
          if (!res) return;

          sessionStorage.setItem('userName', res.userName);
          sessionStorage.setItem('accessToken', res.token);
          sessionStorage.setItem('wmsId', res.wmsId);
          sessionStorage.setItem('workshopName', res.displayName);
          sessionStorage.setItem('country', res.country);
          sessionStorage.setItem('lang', 'sv');
          // ResourcesLoadedGuard will handle loading resources on /sv route
          this.router.navigate(['/sv/dashboard']);
        },
        error: (error) => {
          if (error.status === 400) {
            this.invalidMessage = 'Ogiltigt användarnamn eller lösenord';
          } else {
            this.invalidMessage = 'Ett oväntat fel uppstod.';
          }
          this.logger.error('Login error:', error);
        }
      });
  }

  navigateToForgotPassword(event: Event) {
    event.preventDefault(); // Prevent the default anchor behavior
    this.router.navigate(['/webview/forgetpassword']); // Navigate to the route
  }

  openDialog() {
    // Reset both forms to ensure they're completely isolated when opening login modal
    this.loginForm.reset();
    this.signupForm.reset();
    this.invalidMessage = '';
    this.isDialogVisible = true;
  }

  onCancel() {
    this.isDialogVisible = false;
    // Reset login form when dialog closes for clean state
    this.loginForm.reset();
    this.invalidMessage = '';
  }


  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  onSignupSubmit(): void {
    this.signupForm.markAllAsTouched();

    if (this.signupForm.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Fel', detail: 'Vänligen fyll alla obligatoriska fält korrekt.' });
      return;
    }

    this.isSigningUp = true;
    
    // Gather all signup information
    const signupData = {
      workshopName: this.signupForm.get('companyName')?.value,
      wmsId: this.signupForm.get('organizationNumber')?.value,
      contactPerson: this.signupForm.get('contactPerson')?.value,
      telephone: this.signupForm.get('phoneNumber')?.value,
      userEmail: this.signupForm.get('email')?.value,
      userPassword: this.signupForm.get('password')?.value
    };

    // Call signup API
    this.sharedService
      .signup(signupData)
      .pipe(
        finalize(() => { this.isSigningUp = false; }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.logger.info('Signup successful:', response);
            
            // Send confirmation email with signup information
            this.sendSignupConfirmationEmail(signupData);
            
            this.signupSuccess = true;
            this.messageService.add({ severity: 'success', summary: 'Framgång', detail: 'Din registrering är genomförd. Ditt konto aktiveras snart.' });
            
            setTimeout(() => {
              this.signupSuccess = false;
              this.signupForm.reset();
              this.loginForm.reset(); // Also reset login form for complete isolation
            }, 5000);
          }
        },
        error: (error) => {
          this.logger.error('Signup error:', error);
          const errorMessage = error?.error?.message || 'Ett oväntat fel uppstod under registreringen.';
          this.messageService.add({ severity: 'error', summary: 'Registreringsfel', detail: errorMessage });
        }
      });
  }

  sendSignupConfirmationEmail(signupData: any): void {
    // Call your email sending endpoint here
    // Example endpoint: POST /api/send-email
    const emailPayload = {
      to: signupData.email,
      subject: 'Välkommen till Digital Workshop',
      companyName: signupData.companyName,
      organizationNumber: signupData.organizationNumber,
      phoneNumber: signupData.phoneNumber
    };

    // Call the email endpoint (implement this with your actual endpoint)
    this.http.post(`${this.baseUrl}/api/send-signup-email`, emailPayload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.logger.info('Confirmation email sent successfully:', response);
        },
        error: (error) => {
          this.logger.error('Failed to send confirmation email:', error);
          // Don't show error to user as signup was successful
        }
      });
  }

  openLogin(): void {
    console.log('Open login modal');
  }

  openDemo(): void {
    this.isDemoModalVisible = true;
  }

  closeDemo(): void {
    this.isDemoModalVisible = false;
    // Reset demo form when closing modal
    this.demoForm.reset();
    this.demoSuccess = false;
  }

  onDemoSubmit(): void {
    this.demoForm.markAllAsTouched();

    if (this.demoForm.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Fel', detail: 'Vänligen fyll alla obligatoriska fält korrekt.' });
      return;
    }

    this.isDemoSubmitting = true;
    const signupData = {
      wmsId: `demo-${Math.floor(Date.now() / 1000)}`.substring(0, 14), // Generate a unique wmsId (seconds, max 14 chars)
      contactPerson: this.demoForm.get('name')?.value,
      workshopName: this.demoForm.get('companyName')?.value,
      telephone: this.demoForm.get('phoneNumber')?.value,
      userEmail: this.demoForm.get('email')?.value,
    };
    this.sharedService
      .signup(signupData)
      .pipe(
        finalize(() => { this.isDemoSubmitting = false; }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.logger.info('Demo booking successful:', response);
            this.demoSuccess = true;
            this.messageService.add({ severity: 'success', summary: 'Framgång', detail: 'Vi kontaktar dig snart på e-postadressen du angav för att boka in tid för demo.' });
            
            setTimeout(() => {
              this.closeDemo();
            }, 5000);
          }
        },
        error: (error) => {
          this.logger.error('Demo booking error:', error);
          const errorMessage = error?.error?.message || 'Ett oväntat fel uppstod vid bokning av demo.';
          this.messageService.add({ severity: 'error', summary: 'Bokningsfel', detail: errorMessage });
        }
      });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= window.innerHeight - 100) {
        el.classList.add('visible');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
