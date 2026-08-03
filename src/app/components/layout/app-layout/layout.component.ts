import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router,  RouterModule, RouterOutlet } from '@angular/router';
import { SharedService } from 'app/services/shared.service';
import { AuthService } from 'app/services/auth.service';
import { LogService } from 'app/services/log.service';
import { WorkshopService } from 'app/services/workshop.service';
import { IEnum, IWorkshop } from 'app/app.model';
import { MenuItem, MessageService } from 'primeng/api';
import { filter, finalize, takeUntil, Subject } from 'rxjs';
import { PrimeNG } from 'primeng/config';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Menu } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-layout',
  standalone: true,
 imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    Menu,
    MenubarModule,
    ButtonModule,
    SelectModule,
    SelectButtonModule,
    ToastModule,
    ConfirmDialogModule,
    MessageModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    FormsModule
  ],
  templateUrl: './layout.component.html',
  providers: [MessageService]
})
export class LayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  items: MenuItem[] | undefined;
  workshop!: IWorkshop;
  selectedWorkshop!: IWorkshop;
  workshops: IWorkshop[] = [];
  selectedLang:string = '';
  version = '';
  imagesUrl = 'assets/images/';
  currentUser:string |null = '' ;
   selectedRoute: string = '';
   currentMenuLabel: string = '';
    constructor(
              public readonly sharedService:SharedService,
              private readonly authService: AuthService,
              private readonly router:Router,
              private changeDetectorRef: ChangeDetectorRef,
              private logger: LogService,
              private config: PrimeNG,
              private http: HttpClient,
              private workshopService:WorkshopService
  ) {
      this.version = environment.Version; 
        this.router.events
    .pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntil(this.destroy$)
    )
    .subscribe({
      next: (e: any) => {
        this.selectedRoute = e.urlAfterRedirects;
        this.buildMenu();
        this.currentMenuLabel = this.getSelectedMenuLabel();
      },
      error: (err: any) => {
        this.logger.error('Router navigation error:', err);
      }
    });
  }
       
  ngOnInit(): void {
    this.workshopService
      .getWorkshop()
      .pipe(
        finalize(() => {}),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.workshop = response;
            sessionStorage.setItem('HourlyRate', this.workshop.hourlyRate.toString());
            this.workshops.push(this.workshop);
            this.selectedWorkshop = this.workshops[0];
            this.selectedLang = sessionStorage.getItem('lang') || this.selectedWorkshop.defaultLang;
            this.currentUser = sessionStorage.getItem('userName');
            this.logger.info(this.workshop);
          }
        },
        error: (err) => {
          this.logger.error('Error loading workshop:', err);
        }
      });
  }

  buildMenu() {
        this.items = [
            {
                label: '',
                items: [
                    {
                        label: this.sharedService.T('dashboard'),
                        materialIcon: 'gauge',
                        routerLink: '/sv/dashboard',
                        styleClass: this.selectedRoute.startsWith('/sv/dashboard') ? 'active-menu-item' : ''
                    },
                    {
                        label: this.sharedService.T('customers'),
                        materialIcon: 'user',
                        routerLink:'/sv/customer',
                        styleClass: this.selectedRoute.startsWith('/sv/customer') ? 'active-menu-item' : ''

                    },
                    {
                        label: this.sharedService.T('bookings'),
                        materialIcon: 'calendar',
                        routerLink: '/sv/booking',
                        styleClass: this.selectedRoute === '/sv/booking' ? 'active-menu-item' : ''

                    },
                                        {
                        label: this.sharedService.T('offers'),
                        materialIcon: 'check-square',
                        routerLink: '/sv/offer',
                        styleClass: this.selectedRoute === '/sv/offer' ? 'active-menu-item' : ''
                    },
                    {
                        label: this.sharedService.T('workorders'),
                        materialIcon: 'wrench',
                        routerLink: '/sv/workorder',
                        styleClass: this.selectedRoute === '/sv/workorder' ? 'active-menu-item' : ''
                    },
                    {
                        label: this.sharedService.T('invoices'),
                        materialIcon: 'receipt', 
                        routerLink: '/sv/invoice',
                        styleClass: this.selectedRoute === '/sv/invoice' ? 'active-menu-item' : ''
                    },
                                        {
                        label: this.sharedService.T('digitalServiceBook'),
                        materialIcon: 'book',
                        routerLink: '/sv/digitalservice',
                        styleClass: this.selectedRoute === '/sv/digitalservice' ? 'active-menu-item' : ''
                    },
                   {
                        label: this.sharedService.T('employees'),
                        materialIcon: 'id-card',
                        routerLink: '/sv/employee',
                        styleClass: this.selectedRoute.startsWith('/sv/employee') ? 'active-menu-item' : ''
                    },
      {
                        label: this.sharedService.T('attendanceRegister'),
                        materialIcon: 'stopwatch',
                        routerLink: '/sv/employment',
                        styleClass: this.selectedRoute.startsWith('/sv/employment') ? 'active-menu-item' : ''
                    },
                    {
                       label: this.sharedService.T('settings'),
                        materialIcon: 'cog',
                        routerLink: '/sv/setting',
                        styleClass: this.selectedRoute.startsWith('/sv/settings') ? 'active-menu-item' : ''
                    }

                ]
            }
        ];


  }
  ChangeLang(event:any){
  this.logger.info('language changed::' + event.value);
  sessionStorage.setItem('lang',event.value);
  sessionStorage.setItem('lang', event.value);
  this.selectedLang = event.value;
  window.location.reload();
}


  onLogout() {
    this.authService
        .logout()
        .pipe(
          finalize(() => {}),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (res) => {
            sessionStorage.clear();
            this.logger.info('User logged out successfully');
            this.router.navigate(['/']);
          },
          error: (error) => {
            this.logger.error('Error logging out:', error);
          }
        });
  }

  getSelectedMenuLabel(): string {
    if (this.selectedRoute.startsWith('/sv/dashboard')) {
      return this.sharedService.T('welcome');
    } else if (this.selectedRoute.startsWith('/sv/customer')) {
      return this.sharedService.T('customers');
    } else if (this.selectedRoute.startsWith('/sv/booking')) {
      return this.sharedService.T('bookings');
    } else if (this.selectedRoute.startsWith('/sv/offer')) {
      return this.sharedService.T('offers');
    } else if (this.selectedRoute.startsWith('/sv/workorder')) {
      return this.sharedService.T('workorders');
    } else if (this.selectedRoute.startsWith('/sv/invoice')) {
      return this.sharedService.T('invoices');
    } else if (this.selectedRoute.startsWith('/sv/digitalservice')) {
      return this.sharedService.T('digitalServiceBook');
    } else if (this.selectedRoute.startsWith('/sv/employee')) {
      return this.sharedService.T('employees');
    } else if (this.selectedRoute.startsWith('/sv/employment')) {
      return this.sharedService.T('attendanceRegister');
    } else if (this.selectedRoute.startsWith('/sv/setting')) {
      return this.sharedService.T('settings');
    } else if (this.selectedRoute.startsWith('/sv/vehicle')) {
      return this.sharedService.T('searchVehicle');
    } else {
      return '';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
