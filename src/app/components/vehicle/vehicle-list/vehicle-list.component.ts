import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, filter, of, switchMap } from 'rxjs';
import { SHARED_IMPORTS } from '../../../sharedimports';
import { ICustomer, ICustomerTag, ICustomerType, IEnum, IPager, VehicleSearch, VehicleSearchResponse } from 'app/app.model';
import { SharedService, CustomerService, LogService, WorkshopService } from 'app/services';
import { GenericLoaderComponent } from 'app/components/shared/generic-loader/generic-loader.component';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TreeTableModule } from 'primeng/treetable';
import { CommonModule } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

interface TreeNode {
    data: { [key: string]: any }; // Contains the row data
    children?: TreeNode[]; // Optional child nodes
    parent?: TreeNode; // Optional parent node}
}

// Custom pipes for filtering and reducing
// @Pipe({
//   name: 'filter',
//   standalone: true
// })
// export class FilterPipe implements PipeTransform {
//   transform(items: TreeNode[], field: string, value: any): TreeNode[] {
//     if (!items || !field || value === undefined) {
//       return items;
//     }
//     return items.filter(item => item.data[field] === value);
//   }
// }

// @Pipe({
//   name: 'reduce',
//   standalone: true
// })
// export class ReducePipe implements PipeTransform {
//   transform(items: TreeNode[], field: string, initialValue: number = 0): number {
//     if (!items || !field) {
//       return initialValue;
//     }
//     return items.reduce((sum, item) => {
//       const value = parseFloat(item.data[field]) || 0;
//       return sum + value;
//     }, initialValue);
//   }
// }

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, ...SHARED_IMPORTS, IconFieldModule, InputIconModule, TreeTableModule],
  templateUrl: './vehicle-list.component.html'
})

export class VehicleListComponent {

  vehiclePlates: VehicleSearch[] = [];
  customers: ICustomer[] = [];
  vehiclesData: TreeNode[] = [];
  isLoading: boolean = false;
  cols: any[] = [];
  expandedNodes: { [key: number]: boolean } = {};
  expandedChildNodes: { [key: string]: boolean } = {};
  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly logger: LogService,
    public readonly sharedService: SharedService,
    private readonly route: ActivatedRoute) {



  }

  ngOnInit() {
    this.cols = [
      { field: 'label', header: '' },
      { field: 'customerId', header: this.sharedService.T('id') },
      { field: 'customerName', header: this.sharedService.T('customerName') },
      { field: 'invoiceId', header: this.sharedService.T('id') },
      { field: 'invoiceDate', header: this.sharedService.T('invoiceDate') },
      { field: 'dueDate', header: this.sharedService.T('dueDate') },
      { field: 'totalInvoiceAmount', header: this.sharedService.T('totalInvoiceAmount') },
      { field: 'labourAmount', header: this.sharedService.T('labourAmount') },
      { field: 'partsAmount', header: this.sharedService.T('partsAmount') },
      { field: 'paymentDate', header: this.sharedService.T('paymentDate') },
      { field: 'paymentAmount', header: this.sharedService.T('paymentAmount') },
      { field: 'remainingBalance', header: this.sharedService.T('remainingBalance') },
     
      { field: 'workOrderId', header: this.sharedService.T('id') },
      { field: 'bookingDate', header: this.sharedService.T('bookingDate') },
      { field: 'bookingTime', header: this.sharedService.T('bookingTime') },
      { field: 'employeeName', header: this.sharedService.T('employeeName') },
      { field: 'workOrderStatus', header: this.sharedService.T('status') },
      { field: 'supplierPurchaseDetails', header: this.sharedService.T('supplierPurchaseDetails') },
      
      
      { field: 'offerId', header: this.sharedService.T('id') },
      { field: 'offerDate', header: this.sharedService.T('offerDate') },
      { field: 'isAccepted', header: this.sharedService.T('isAccepted') },
      { field: 'digitalServiceId', header: this.sharedService.T('id') },
      { field: 'serviceDate', header: this.sharedService.T('serviceDate') },
      { field: 'serviceType', header: this.sharedService.T('serviceType') },
      { field: 'vehicleMileage', header: this.sharedService.T('vehicleMileage') }
    ];

  }

  keyupVehicle(event: any) {
    if (event?.value) {
      this.sharedService
      .getVehicleList(event.value)
      .pipe(
        catchError((err) => {
          this.isLoading = false;
          console.log(err);
          throw err;
        })
      )
      .subscribe((response: any) => {
        this.isLoading = false;
        if (response) {
          this.logger.info('Vehicle Info:');
          this.logger.info(response);
          this.vehiclePlates = response;
        }
      });
    }
  }
    onClearVehicle() {
      this.logger.info('Clearing vehicle search input and results');
      this.vehiclePlates = [];
      this.vehiclesData = [];
  }

  onSelectVehicle(event: any) {
    this.logger.info('Selected vehicle plate: ' + event.value.vehiclePlate);
    this.loadvehicle(event.value.vehiclePlate);
  }
  loadvehicle(vehiclePlate: string)
  {
    this.isLoading = true;
    this.sharedService
      .getVehicleInfo(vehiclePlate)
      .pipe(
        catchError((err) => {
          this.isLoading = false;
          console.log(err);
          throw err;
        })
      )
      .subscribe((response: any) => {
        this.isLoading = false;
        if (response) {
          this.logger.info('Vehicle Info:');
          this.logger.info(response);
          const jsonData = response.dataPayload;
          this.vehiclesData = [
            {
              data: {
                label: this.sharedService.T('customer'),
                customerId: jsonData.customerId,
                customerName: jsonData.customerName
              },
              children: [
                {
                  data: { 
                    label: 'invoices',
                    totalInvoiceCount: response.totalInvoiceCount,
                    totalInvoiceAmount: response.totalInvoiceAmount,
                    paidInvoiceAmount: response.paidInvoiceAmount,
                    unpaidInvoiceAmount: response.unpaidInvoiceAmount
                  },
                  children: jsonData.invoices?.map((invoice: any) => ({
                    data: {
                      label: this.sharedService.T('invoice'),
                      invoiceId: invoice.invoiceId,
                      invoiceDate: this.getDateString(invoice.invoiceDate),
                      dueDate: this.getDateString(invoice.dueDate),
                      totalInvoiceAmount: invoice.totalInvoiceAmount,
                      labourAmount: invoice.labourAmount,
                      partsAmount: invoice.partsAmount,
                      paymentDate: this.getDateString(invoice.paymentDate),
                      paymentAmount: invoice.paymentAmount,
                      remainingBalance: invoice.remainingBalance
                    }
                  })) || []
                },
                {
                  data: { 
                    label: 'workorders',
                    totalWorkOrderCount: response.totalWorkOrderCount,
                    lastWorkOrderDate: this.getDateString(response.lastWorkOrderDate),
                    totalWOPurchaseCount: response.totalWOPurchaseCount
                  },
                  children: jsonData.workOrders?.map((workOrder: any) => ({
                    data: {
                      label: this.sharedService.T('workorder'),
                      workOrderId: workOrder.workOrderId,
                      bookingDate: this.getDateString(workOrder.bookingDate),
                      bookingTime: workOrder.bookingTime,
                      employeeName: workOrder.employeeName,                       
                      workOrderStatus: workOrder.workOrderStatus,
                      supplierPurchaseDetails:workOrder.supplierPurchaseDetails

                    }
                  })) || []
                },
                {
                  data: { 
                    label: 'offers',
                    totalOfferCount: jsonData.totalOfferCount
                  },
                  children: jsonData.offers?.map((offer: any) => ({
                    data: {
                      label: this.sharedService.T('offer'),
                      offerId: offer.offerId,
                      offerDate: this.getDateString(offer.offerDate),
                      priceIncVat: offer.priceIncVat,
                      isAccepted: offer.isAccepted
                    }
                  })) || []
                },
                {
                  data: { 
                    label: 'digitalServiceRecord',
                    totalDigitalServiceCount: response.totalDigitalServiceCount,
                    lastDigitalServiceDate: this.getDateString(response.lastDigitalServiceDate)
                  },
                  children: jsonData.digitalServices?.map((service: any) => ({
                    data: {
                      label: this.sharedService.T('digitalServiceRecord'),
                      digitalServiceId: service.digitalServiceId,
                      serviceDate: this.getDateString(service.serviceDate),
                      serviceType: service.serviceType,
                      vehicleMileage: service.vehicleMileage
                    }
                  })) || []
                }
              ]
            }
          ];
        }
        console.log('Transformed Vehicles Data:', JSON.stringify(this.vehiclesData, null, 2));
      });
  }

  toggleNode(idx: number): void {
    this.expandedNodes[idx] = !this.expandedNodes[idx];
  }
  getDateString(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    let formattedDate = date.toISOString().split('T')[0];
    return formattedDate;
  }
  toggleChildNode(idx: number, cidx: number): void {
    const key = `${idx}-${cidx}`;
    this.expandedChildNodes[key] = !this.expandedChildNodes[key];
  }

  getRelevantColumns(rowData: any, level: string): any[] {
    if (level === 'customer') {
      // Customer level: show only customer-related columns
      return this.cols.filter(c => ['label', 'customerId', 'customerName'].includes(c.field));
    } else if (level === 'category') {
      // Category level: only show label
      return this.cols.filter(c => c.field === 'label');
    } else if (level === 'invoice') {
      // Invoice items: show invoice-related columns
      return this.cols.filter(c => ['label', 'invoiceId', 'invoiceDate', 'dueDate', 'totalInvoiceAmount', 'labourAmount', 'partsAmount', 'paymentDate', 'paymentAmount', 'remainingBalance'].includes(c.field));
    
    } else if (level === 'workorder') {
      // Work order items: show work order-related columns
      return this.cols.filter(c => ['label', 'workOrderId','bookingDate','bookingTime', 'workOrderDate','employeeName', 'workOrderStatus','supplierPurchaseDetails'].includes(c.field));
    } else if (level === 'offer') {
      // Offer items: show offer-related columns
      return this.cols.filter(c => ['label', 'offerId', 'offerDate', 'priceIncVat', 'isAccepted'].includes(c.field));
    } else if (level === 'service') {
      // Digital service items: show service-related columns
      return this.cols.filter(c => ['label', 'digitalServiceId', 'serviceDate', 'serviceType', 'vehicleMileage'].includes(c.field));
    }
    return this.cols;
  }
}