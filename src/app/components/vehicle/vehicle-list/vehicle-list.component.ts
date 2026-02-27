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
      { field: 'label', header: 'Label' },
      { field: 'customerId', header: 'Customer ID' },
      { field: 'customerName', header: 'Customer Name' },
      { field: 'invoiceId', header: 'Invoice ID' },
      { field: 'invoiceDate', header: 'Invoice Date' },
      { field: 'priceIncVat', header: 'Price (Inc. VAT)' },
      { field: 'isPaid', header: 'Is Paid' },
      { field: 'workOrderId', header: 'Work Order ID' },
      { field: 'workOrderDate', header: 'Work Order Date' },
      { field: 'workOrderStatus', header: 'Work Order Status' },
      { field: 'offerId', header: 'Offer ID' },
      { field: 'offerDate', header: 'Offer Date' },
      { field: 'isAccepted', header: 'Is Accepted' },
      { field: 'digitalServiceId', header: 'Digital Service ID' },
      { field: 'serviceDate', header: 'Service Date' },
      { field: 'serviceType', header: 'Service Type' },
      { field: 'vehicleMileage', header: 'Vehicle Mileage' }
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
                label: 'Customer',
                customerId: jsonData.customerId,
                customerName: jsonData.customerName
              },
              children: [
                {
                  data: { 
                    label: 'Invoices',
                    totalInvoiceCount: response.totalInvoiceCount,
                    totalInvoiceAmount: response.totalInvoiceAmount,
                    paidInvoiceAmount: response.paidInvoiceAmount,
                    unpaidInvoiceAmount: response.unpaidInvoiceAmount
                  },
                  children: jsonData.invoices?.map((invoice: any) => ({
                    data: {
                      label: 'Invoice',
                      invoiceId: invoice.invoiceId,
                      invoiceDate: invoice.invoiceDate,
                      priceIncVat: invoice.priceIncVat,
                      isPaid: invoice.isPaid
                    }
                  })) || []
                },
                {
                  data: { 
                    label: 'Work Orders',
                    totalWorkOrderCount: response.totalWorkOrderCount,
                    lastWorkOrderDate: response.lastWorkOrderDate,
                    totalWOPurchaseCount: response.totalWOPurchaseCount
                  },
                  children: jsonData.workOrders?.map((workOrder: any) => ({
                    data: {
                      label: 'Work Order',
                      workOrderId: workOrder.workOrderId,
                      workOrderDate: workOrder.workOrderDate,
                      workOrderStatus: workOrder.workOrderStatus
                    }
                  })) || []
                },
                {
                  data: { 
                    label: 'Offers',
                    totalOfferCount: jsonData.totalOfferCount
                  },
                  children: jsonData.offers?.map((offer: any) => ({
                    data: {
                      label: 'Offer',
                      offerId: offer.offerId,
                      offerDate: offer.offerDate,
                      priceIncVat: offer.priceIncVat,
                      isAccepted: offer.isAccepted
                    }
                  })) || []
                },
                {
                  data: { 
                    label: 'Digital Services',
                    totalDigitalServiceCount: response.totalDigitalServiceCount,
                    lastDigitalServiceDate: response.lastDigitalServiceDate
                  },
                  children: jsonData.digitalServices?.map((service: any) => ({
                    data: {
                      label: 'Service',
                      digitalServiceId: service.digitalServiceId,
                      serviceDate: service.serviceDate,
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
      return this.cols.filter(c => ['label', 'invoiceId', 'invoiceDate', 'priceIncVat', 'isPaid'].includes(c.field));
    } else if (level === 'workorder') {
      // Work order items: show work order-related columns
      return this.cols.filter(c => ['label', 'workOrderId', 'workOrderDate', 'workOrderStatus'].includes(c.field));
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