import { Component, OnInit, OnDestroy, ChangeDetectorRef, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedService } from 'app/services/shared.service';
import { ProductService } from 'app/services/product.service';
import { LogService } from 'app/services/log.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { IInventory, IProduct, IPager, IInvoiceDetail, IProductChart } from 'app/app.model';
import { switchMap, catchError, finalize, takeUntil, Subject } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { DatePickerModule } from 'primeng/datepicker';
import { ChartModule } from 'primeng/chart';
@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    InputNumberModule,
    TableModule,
    ToastModule,
    DialogModule,
    ConfirmDialogModule,
    MessageModule,
    ProgressSpinnerModule,
    TabsModule,
    DatePickerModule,
    ChartModule 
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  basicData: any;
  basicOptions: any;
  productId: number = 0;
  isLoading: boolean = false;

  itemsSold: number = 0;
  totalRevenue: number = 0;
  product: IProduct | null = null;
  saleHistory: IInvoiceDetail[] = [];
  chartLabels: string[] = [];
  chartData: number[] = [];
  constructor(
    private logger: LogService,
    public readonly sharedService: SharedService,
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit() {
    if (this.productId) {

       this.getProduct();
       this.getSaleHistory();
       // get chart data 
      this.productService.getProductChart(this.productId)
      .pipe(
        finalize(() => { this.isLoading = false; }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: IProductChart[]) => {
          this.chartLabels = res.map(item => item.monthName);
          this.chartData = res.map(item => item.totalQuantity);
          this.initChart();
        },
        error: (err) => {
          this.logger.error('Error loading chart data:', err);
        }
      });        
    }
  }

  getProduct()
  {
      this.productService.getProduct(this.productId)
        .pipe(
          finalize(() => { this.isLoading = false; }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (res: any) => {
            this.logger.info('Product loaded:', res);
            this.product = res.data;
          },
          error: (err) => {
            this.logger.error('Error loading product:', err);
          }
        });

  }
  getSaleHistory()
  {
    this.productService.getProductSaleHistory(this.productId)
      .pipe(
        finalize(() => { this.isLoading = false; }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          this.saleHistory = res;
          this.itemsSold = this.saleHistory.reduce((sum, item) => sum + (item.quantity || 0), 0);
          this.totalRevenue = this.saleHistory.reduce((sum, item) => sum + (item.price || 0), 0);
        },
        error: (err) => {
          this.logger.error('Error loading sales:', err);
        }
      });     
  }
  
  initChart() {
        if (isPlatformBrowser(this.platformId)) {
            const documentStyle = getComputedStyle(document.documentElement);
            const textColor = documentStyle.getPropertyValue('--p-text-color');
            const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
            const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');
        
            this.basicData = {
                labels: this.chartLabels,
                datasets: [
                    {
                        label: this.sharedService.T('itemsSoldByMonth'),
                        data: this.chartData,
                        backgroundColor: 'rgba(6, 182, 212, 0.2)',
                        borderColor: 'rgb(6, 182, 212)',
                        borderWidth: 1
                    }
                ]
            };
        
            this.basicOptions = {
                indexAxis: 'y',
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        align: 'start',
                        labels: {
                            color: textColor,
                            padding: 10
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: textColorSecondary
                        },
                        grid: {
                            color: surfaceBorder
                        },
                        barPercentage: 0.4,
                        categoryPercentage: 1.0
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: textColorSecondary
                        },
                        grid: {
                            color: surfaceBorder
                        }
                    }
                }
            };
            this.cdr.markForCheck();
        }
      }
 
  redirectToInvoiceDetailComponent(invoiceId: number) {
    this.router.navigate([`sv/invoice/details/${invoiceId}`]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}