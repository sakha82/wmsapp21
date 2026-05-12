import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IEmployee, IWorkOrder } from 'app/app.model';
import { SharedService } from 'app/services/shared.service';
import { BookingService } from 'app/services/booking.service';
import { EmployeeService } from 'app/services/employee.service';
import { LogService } from 'app/services/log.service';
import { ErrorHandlerService } from 'app/services/error-handler.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SelectChangeEvent } from 'primeng/select';
import { firstValueFrom, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { CheckboxModule } from 'primeng/checkbox';
import { BadgeModule } from 'primeng/badge';
import { PanelModule } from 'primeng/panel';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    SelectModule,
    ToastModule,
    ConfirmDialogModule,
    MessageModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    DatePickerModule,
    CheckboxModule,
    CarouselModule,
    BadgeModule,
    PanelModule,
    DialogModule,
    TableModule
  ],
  templateUrl: './booking-list.component.html',
  providers: [ConfirmationService, MessageService, ConfirmDialogModule],
  styleUrls: ['./booking-list.component.css']
})
export class BookingListComponent implements OnInit, OnDestroy {

  @ViewChild('op') popover: any;
  days: string[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  private destroy$ = new Subject<void>();

  hoveredSlot: { day: string; time: string } | null = null;
  filters: FormGroup;
  //weekCalendar: IWeeklyCalendar[] = [];
  weekCalendar: any[] = [];
  bookingsCount: { [key: string]: number } = {};
  serviceHoursCount: { [key: string]: number } = {};

  selectedDay: number = new Date().getDay();
  selectedYear: number;
  selectedMonth: string = '';
  selectedWeek: number;
  selectedStartDate: string = ''
  selectedEndDate: string = ''
  isLoading: boolean = false
  selectedPaymentTypeText: string = '';
  selectedServiceTypeText: string = '';
  selectedCustomerName: string = '';
  selectedEmployeeName: string = '';

  currentWeekMondayDate: string = '';
  currentWeekMondayBookingCount: number = 0;
  currentWeekTuesdayBookingCount: number = 0;
  currentWeekWednesdayBookingCount: number = 0;
  currentWeekThursdayBookingCount: number = 0;
  currentWeekFridayBookingCount: number = 0;
  currentWeekSaturdayBookingCount: number = 0;
  currentWeekSundayBookingCount: number = 0;

  currentWeekTuesdayDate: string = '';
  currentWeekWednesdayDate: string = '';
  currentWeekThursdayDate: string = '';
  currentWeekFridayDate: string = '';
  currentWeekSaturdayDate: string = '';
  currentWeekSundayDate: string = '';

  date: Date[] | undefined;
  employees: IEmployee[] = [];
  selectedEmployees: IEmployee[] = [];
  selectedBooking: IWorkOrder = {} as IWorkOrder;
  isDialogVisible: boolean = false;
  openMenuKey: string | null = null;

  constructor(private logger: LogService,
    private readonly errorHandler: ErrorHandlerService,
    public readonly sharedService: SharedService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private readonly fb: FormBuilder,
    private readonly bookingService: BookingService,
    private readonly employeeService: EmployeeService,
    private readonly route: ActivatedRoute,
  ) {

    //this.selectedWeek = this.sharedService.getCurrentWeekNumber(new Date());
    this.selectedYear = new Date().getFullYear();

    var currentWeek = this.getWeekInfo(new Date(), 'current');
    this.selectedStartDate = currentWeek.startDate;
    this.selectedEndDate = currentWeek.endDate;
    this.selectedWeek = currentWeek.weekNumber;

    const currentDate = new Date();
    const monthName = currentDate.toLocaleString('default', { month: 'long' }); // Get full month name
    const year = currentDate.getFullYear();
    this.selectedMonth = `${monthName} ${year}`;

    this.filters = this.fb.group({
      serviceType: '',
      employeeIds: [],
    });
  }

  async ngOnInit(): Promise<void> {

    try {
      await this.getEmployees();
      this.selectedEmployees = [...this.employees];
      this.route.queryParams.subscribe((params) => { this.sharedService.updateFiltersFromQueryParams(this.filters, params) });
      this.filters.patchValue({ employeeIds: this.selectedEmployees.map(employee => employee.employeeId).join(',') });
      this.sharedService.updateFiltersInNavigation(this.filters);
  

      this.getBookings();
    } catch (error) {
      this.logger.error('Error during initialization:', error);
    } finally {
      // Set loading to false once everything is done
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async getEmployees(): Promise<void> {
    try {
  

      const response = await firstValueFrom(this.employeeService.getAllEmployees());
      this.employees = response;
      this.logger.info('getEmployees success', { employees: this.employees });
    } catch (error) {
      this.errorHandler.handleError(error, 'getEmployees', 'Failed to fetch employees');
    }
  }
  getKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  calculateFreeHours(day: string): number {
    const workshopCapacity = 8; // Assuming 8 working hours in a day
    const busyHours = this.serviceHoursCount[day] || 0;
    const freeHours = workshopCapacity - busyHours;

    // Ensure the result is not negative and round to one decimal place
    return Math.max(0, Math.round(freeHours * 10) / 10);
  }
  getBookings() {
    this.isLoading = true;


    this.logger.info('getBookings called', { filters: this.filters.value });
    this.bookingService
      .getWeeklyBookings(this.selectedStartDate, this.selectedEndDate, this.filters)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          if (res) {
            // this.weekCalendar = res;
            this.weekCalendar = this.processMultiSlotBookings(res);
            this.logger.info('getBookings success', { weekCalendar: this.weekCalendar });




            this.days.forEach(day => {
              // Unique Work Orders nikalne ke liye Set banayein
              const uniqueBookings = new Set();

              this.weekCalendar.forEach(row => {
                const dayBookings = row[`${day}Bookings`];
                if (dayBookings && dayBookings.length > 0) {
                  dayBookings.forEach((b: any) => {
                    // Sirf unique workOrderId ko add karein
                    uniqueBookings.add(b.workOrderId);
                  });
                }
              });

              // Ab unique counts assign karein
              this.bookingsCount[day] = uniqueBookings.size;
            });

  
            this.days.forEach(day => {
              const countedWorkOrders = new Set<number>();

              const totalHours = this.weekCalendar.reduce((total, row) => {
                const dayBookings = row[`${day}Bookings` as keyof any]; // cast to keyof for TS safety

                if (dayBookings && dayBookings.length > 0) {
                  const rowHours = dayBookings.reduce((bookingTotal: number, booking: any) => {
                    // CRITICAL: If we already added these hours for this WO today, skip it
                    if (countedWorkOrders.has(booking.workOrderId)) {
                      return bookingTotal;
                    }

                    // Calculate total hours from woServices
                    const serviceHours = booking.woServices?.reduce((woTotal: number, service: any) =>
                      woTotal + (service.quantity ?? 0), 0) ?? 0;

                    // Mark this WO as counted
                    countedWorkOrders.add(booking.workOrderId);

                    return bookingTotal + serviceHours;
                  }, 0);

                  return total + rowHours;
                }
                return total;
              }, 0);

              // Round to 1 decimal place
              this.serviceHoursCount[day] = Math.round(totalHours * 10) / 10;
            });
            this.logger.info('Bookings count calculated:', this.bookingsCount);
            this.logger.info('Service hours count calculated:', this.serviceHoursCount);
          }
        },
        error: (err) => {
          this.errorHandler.handleError(err, 'getBookings', 'Failed to load bookings. Please try again later.');
        }
      });
  }
  // multi-pule solts booking
  processMultiSlotBookings(data: any[]): any[] {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    data.forEach((row, rowIndex) => {
      days.forEach(day => {
        const bookingsKey = `${day}Bookings`;

        if (row[bookingsKey] && row[bookingsKey].length > 0) {
          // We look at bookings originally starting in this row
          // We use a clone to avoid infinite loops while iterating
          const originalBookings = [...row[bookingsKey]];

          originalBookings.forEach(booking => {
            // Only process if it's the "start" of the booking to prevent re-processing duplicates
            if (booking.bookingTime === row.cTime) {
              const hours = parseFloat(booking.estimatedHours || '0.5');
              const slotsToSpan = Math.ceil(hours / 0.5); // Convert hours to number of 30-min slots

              // Start from the next row and push the booking object
              for (let i = 1; i < slotsToSpan; i++) {
                const nextRow = data[rowIndex + i];
                if (nextRow) {
                  if (!nextRow[bookingsKey]) nextRow[bookingsKey] = [];

                  // Add the booking to the next slot if it's not already there
                  const alreadyExists = nextRow[bookingsKey].some((b: any) => b.workOrderId === booking.workOrderId);
                  if (!alreadyExists) {
                    nextRow[bookingsKey].push(booking);
                  }
                }
              }
            }
          });
        }
      });
    });

    return data;
  }
  onSelectMonth(d: Date) {
    let selectedDate = new Date(d.getFullYear(), d.getMonth(), 1);

    let selectedWeek = this.getWeekInfo(selectedDate, 'current');
    this.selectedStartDate = selectedWeek.startDate;
    this.selectedEndDate = selectedWeek.endDate;
    this.selectedWeek = selectedWeek.weekNumber;
    this.getBookings();
    //this.selectedYear = selectedDate.getFullYear();

  }



  onClickPreviousWeek() {
    const previousstartDateObject = new Date(this.selectedStartDate);
    let selectedWeek = this.getWeekInfo(previousstartDateObject, 'previous');
    this.selectedStartDate = selectedWeek.startDate;
    this.selectedEndDate = selectedWeek.endDate;
    this.selectedWeek = selectedWeek.weekNumber;

    const currentstartDateObject = new Date(this.selectedStartDate);
    const monthName = currentstartDateObject.toLocaleString('default', { month: 'long' }); // Get full month name
    const year = currentstartDateObject.getFullYear();

    this.selectedMonth = `${monthName} ${year}`;

    this.getBookings();


  }

  onClickNextWeek() {
    const previousstartDateObject = new Date(this.selectedStartDate);
    let selectedWeek = this.getWeekInfo(previousstartDateObject, 'next');
    this.selectedStartDate = selectedWeek.startDate;
    this.selectedEndDate = selectedWeek.endDate;
    this.selectedWeek = selectedWeek.weekNumber;

    const currentstartDateObject = new Date(this.selectedStartDate);
    const monthName = currentstartDateObject.toLocaleString('default', { month: 'long' }); // Get full month name
    const year = currentstartDateObject.getFullYear();

    this.selectedMonth = `${monthName} ${year}`;

    this.getBookings();

  }

  viewBooking(id: string): void {
    console.log(`Viewing booking with ID: ${id}`);
  }

  editBooking(id: string): void {
    console.log(`Editing booking with ID: ${id}`);
  }

  onChangeBookingType(event: SelectChangeEvent) {
    this.filters.patchValue({ isReserved: event.value });
    this.sharedService.updateFiltersInNavigation(this.filters);
    this.getBookings();
  }

  // onChangeEmployee(event: SelectChangeEvent) {
  //   this.selectedEmployees = event.value;
  //   this.filters.patchValue({ employeeIds: this.selectedEmployees.map(employee => employee.employeeId).join(',') });
  //    this.sharedService.updateFiltersInNavigation(this.filters);
  //   this.getBookings();
  // }
  onChangeEmployee() {
    // selectedEmployees already updated hai ngModel ki wajah se
    const ids = this.selectedEmployees.map((emp: any) => emp.employeeId).join(',');

    this.filters.patchValue({ employeeIds: ids });
    this.sharedService.updateFiltersInNavigation(this.filters);
    this.getBookings();
  }
  onSelectFromDate() {

    //this.filters.patchValue({fromDate: selectedFromDate.toISOString().split('T')[0] });
    //this.logger.info(this.filters.get('fromDate')?.value);
    //this.filters.patchValue({fromDate: this.filters.get('fromDate')?.value });
    this.getBookings();
  }

  onSelectToDate() {
    //this.filters.patchValue({toDate: selectedToDate});
    this.getBookings();
  }

  showBookingInfo(booking: IWorkOrder) {
    this.logger.info('inside');
    this.logger.info(booking);
    this.selectedBooking = booking;
    this.selectedCustomerName = booking.customerName;
    this.selectedEmployeeName = booking.employeeName;
    this.selectedPaymentTypeText = this.sharedService.getEnumByValue('paymentType', booking.paymentType).text;
    //this.selectedServiceTypeText = this.sharedService.getEnumByValue('serviceType',booking.serviceType).text;
    this.isDialogVisible = true;
  }

  toggleBookingMenu(event: Event, key: string) {
    event.stopPropagation();
    this.openMenuKey = this.openMenuKey === key ? null : key;
  }

  bookingLabel(booking: IWorkOrder): string {
    const parts = [
      booking.vehiclePlate,
      booking.vehicleManufacturer,
      booking.vehicleModel,
      booking.vehicleYear,
    ].filter(Boolean);
    return parts.join(' ');
  }

  printBooking(event: Event, booking: IWorkOrder) {
    event.stopPropagation();
    if (!booking?.workOrderId) {
      this.messageService.add({
        severity: 'error',
        summary: '',
        detail: 'Missing work order id.',
        life: 3000,
      });
      return;
    }
    this.sharedService
      .printPdf('workorder', booking.workOrderId.toString(), 'basic')
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.logger.info('printBooking success', { bookingId: booking.workOrderId });
            var newBlob = new Blob([response], { type: "application/pdf" });
            window.open(window.URL.createObjectURL(newBlob));
          }
        },
        error: (err) => {
          this.errorHandler.handleError(err, 'printBooking', 'Failed to generate PDF. Please try again later.');
        }
      });
  }

  isTimeBookedAt(timeStr: string): boolean {
    const currentMinutes = this.toMinutes(timeStr);
    if (currentMinutes === null) {
      return false;
    }
    const dayKeys = [
      'mondayBookings',
      'tuesdayBookings',
      'wednesdayBookings',
      'thursdayBookings',
      'fridayBookings',
      'saturdayBookings',
      'sundayBookings',
    ] as const;

    for (const row of this.weekCalendar) {
      for (const dayKey of dayKeys) {
        const bookings = row[dayKey] as IWorkOrder[] | undefined;
        if (!bookings?.length) {
          continue;
        }
        for (const booking of bookings) {
          const startMinutes = this.toMinutes(booking.bookingTime || row.cTime);
          const durationMinutes = this.getDurationMinutes(booking);
          if (startMinutes === null || durationMinutes === null) {
            continue;
          }
          const endMinutes = startMinutes + durationMinutes;
          if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private toMinutes(timeStr: string): number | null {
    if (!timeStr) {
      return null;
    }
    const parts = timeStr.split(':').map((part) => Number.parseInt(part, 10));
    if (parts.length < 2 || parts.some((val) => Number.isNaN(val))) {
      return null;
    }
    return parts[0] * 60 + parts[1];
  }

  private getDurationMinutes(booking: IWorkOrder): number | null {
    const hours = Number.parseFloat(booking.estimatedHours ?? '');
    if (Number.isFinite(hours) && hours > 0) {
      return Math.round(hours * 60);
    }
    if (booking.woServices?.length) {
      const sum = booking.woServices.reduce((total, service) => total + (service.quantity || 0), 0);
      if (sum > 0) {
        return Math.round(sum * 60);
      }
    }
    return null;
  }

  scrollBooking(event: Event, direction: number) {
    const target = event.currentTarget as HTMLElement | null;
    const slider = target?.closest('.booking-slider') as HTMLElement | null;
    const track = slider?.querySelector('.booking-track') as HTMLElement | null;
    if (!track) {
      return;
    }
    const slides = Array.from(track.querySelectorAll<HTMLElement>('.booking-slide'));
    if (slides.length === 0) {
      return;
    }
    const current = slides.reduce((closestIdx, slide, idx) => {
      const closest = slides[closestIdx];
      return Math.abs(slide.offsetLeft - track.scrollLeft) < Math.abs(closest.offsetLeft - track.scrollLeft)
        ? idx
        : closestIdx;
    }, 0);
    const next = Math.max(0, Math.min(slides.length - 1, current + direction));
    track.scrollTo({ left: slides[next].offsetLeft, behavior: 'smooth' });
  }

  scrollToIndex(event: Event, index: number) {
    const target = event.currentTarget as HTMLElement | null;
    const slider = target?.closest('.booking-slider') as HTMLElement | null;
    const track = slider?.querySelector('.booking-track') as HTMLElement | null;
    if (!track) {
      return;
    }
    const slides = Array.from(track.querySelectorAll<HTMLElement>('.booking-slide'));
    const clamped = Math.max(0, Math.min(slides.length - 1, index));
    if (!slides[clamped]) {
      return;
    }
    track.scrollTo({ left: slides[clamped].offsetLeft, behavior: 'smooth' });
  }

  createBooking(bookingDate: string, bookingTime: string) {
    this.router.navigate(['sv/workorder/crud', { bookingDate: bookingDate, bookingTime: bookingTime }]);
  }


  printBookings(selectedDate: any) {
    this.logger.info('printBookings called', { selectedDate });
    this.bookingService
      .getWorkOrdersByBookingTime(selectedDate, '')
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          if (response) {
            let workorders: IWorkOrder[] = response;
            let workOrderIds = '';
            workorders.forEach(function (workOrder) {
              workOrderIds += workOrder.workOrderId.toString() + ",";
            });
            workOrderIds = workOrderIds.substring(0, workOrderIds.length - 1);
            this.logger.info('printBookings - workOrder ids generated', { ids: workOrderIds });
            this.sharedService
              .printPdf('workorder', workOrderIds, 'basic')
              .pipe(
                takeUntil(this.destroy$)
              )
              .subscribe({
                next: (response: any) => {
                  if (response) {
                    this.logger.info('printBookings PDF generated successfully');
                    var newBlob = new Blob([response], { type: "application/pdf" });
                    window.open(window.URL.createObjectURL(newBlob));
                  }
                },
                error: (err) => {
                  this.errorHandler.handleError(err, 'printBookings', 'Failed to generate PDF. Please try again later.');
                }
              });
          }
        },
        error: (err) => {
          this.errorHandler.handleError(err, 'printBookings', 'Failed to fetch work orders for printing. Please try again later.');
        }
      });
  }
  deleteBooking(workOrderId: number, event: any) {
    this.logger.info('deleteBooking called', { workOrderId });

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to this Booking?', //this.sharedService.T('workorder-list.confirm.message') + statusText,
      header: '',
      closable: false,
      closeOnEscape: false,
      rejectButtonProps: {
        label: this.sharedService.T('workorder-list.confirm.cancel'),
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: this.sharedService.T('workorder-list.confirm.save'),
      },
      accept: () => {
        this.bookingService
          .deleteBooking(workOrderId)
          .pipe(
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: (res: any) => {
              if (res) {
                this.logger.info('deleteBooking success', { workOrderId });
                this.messageService.add({ severity: 'info', summary: '', detail: this.sharedService.T('workorder-list.confirm.save.message') });
                this.getBookings();
                this.getEmployees();
              }
            },
            error: (err) => {
              this.errorHandler.handleError(err, 'deleteBooking', 'Failed to delete booking. Please try again later.');
            }
          });

      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: '',
          detail: this.sharedService.T('workorder-list.confirm.cancel.message'),
          life: 3000,
        });
      },
    });
  }

  getCssClass(description: string) {
    let color = 'lightBlue';
    if (description == 'helg')
      color = '#FF1A00';
    return `py-1 px-2 mb-1 rounded-sm w-fit text-xs font-bold text-[${color}] bg-[#FF1A001A]`
  }

  onCancel() {
    this.isDialogVisible = false;
  }

  getWeekInfo(date: Date, flag: 'current' | 'previous' | 'next'): { weekNumber: number, startDate: string, endDate: string } {
    const currentDate = new Date(date.getTime());

    // Adjust the date based on the flag
    if (flag === 'previous') {
      currentDate.setDate(currentDate.getDate() - 7); // Go back one week
    } else if (flag === 'next') {
      currentDate.setDate(currentDate.getDate() + 7); // Go forward one week
    }

    // Calculate the week number
    const d = new Date(currentDate.getTime());
    d.setDate(d.getDate() + 4 - (d.getDay() || 7)); // Adjust to Thursday in current week
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

    // Calculate the start and end dates of the week
    const dayOfWeek = currentDate.getDay() || 7; // Sunday is 0, so make it 7
    const startOfWeek = new Date(currentDate);
    const endOfWeek = new Date(currentDate);

    startOfWeek.setDate(currentDate.getDate() - dayOfWeek + 1); // Monday
    endOfWeek.setDate(currentDate.getDate() + (7 - dayOfWeek)); // Sunday

    // Format dates to yyyy-mm-dd
    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0'); // Ensure 2 digits
      const day = String(d.getDate()).padStart(2, '0'); // Ensure 2 digits
      return `${year}-${month}-${day}`;
    };

    return {
      weekNumber,
      startDate: formatDate(startOfWeek),
      endDate: formatDate(endOfWeek),
    };
  }

  getBookingBackground(employeeId: number | null): string {
    const defaultColor = 'var(--p-primary-50, #f0f9ff)';

    if (!employeeId || !this.employees) {
      return defaultColor;
    }

    const employee = this.employees.find(emp => emp.employeeId === employeeId);

    // Return employee color if it exists, otherwise return default
    return employee && employee.calendarColor ? employee.calendarColor : defaultColor;
  }
  // Add this to your .ts file
  getSlotSpan(estimatedHours: string | number): number {
    const hours = parseFloat(estimatedHours.toString()) || 0.5;
    // Each row is 30 mins (0.5 hours). 
    // We use Math.ceil to ensure a 1.3 hour booking takes 3 slots (1.5 hours)
    return Math.ceil(hours / 0.5);
  }
  getCarouselStyles(bookings: any[]): { [key: string]: string } {
    const styles: { [key: string]: string } = {};
    bookings.forEach((b, idx) => {
      styles[`--dot-color-${idx}`] = this.getBookingBackground(b.employeeId);
    });
    return styles;
  }
}


