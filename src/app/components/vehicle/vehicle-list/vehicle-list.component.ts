import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, filter, of, switchMap } from 'rxjs';
import { SHARED_IMPORTS } from '../../../sharedimports';
import { ICustomer, ICustomerTag, ICustomerType, IEnum, IPager, VehicleSearchResponse } from 'app/app.model';
import { SharedService, CustomerService, LogService, WorkshopService } from 'app/services';
import { GenericLoaderComponent } from 'app/components/shared/generic-loader/generic-loader.component';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TreeTableModule } from 'primeng/treetable';
import { CommonModule } from '@angular/common';

interface TreeNode {
    data: { [key: string]: any }; // Contains the row data
    children?: TreeNode[]; // Optional child nodes
    parent?: TreeNode; // Optional parent node}
}

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, ...SHARED_IMPORTS, IconFieldModule, InputIconModule, TreeTableModule],
  templateUrl: './vehicle-list.component.html'
})

export class VehicleListComponent {

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

    this.loadvehicle();
  }

  loadvehicle()
  {
    this.isLoading = true;
    this.sharedService
      .getVehicleInfo('AAM14L')
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
                  data: { label: 'Invoices' },
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
                  data: { label: 'Work Orders' },
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
                  data: { label: 'Offers' },
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
                  data: { label: 'Digital Services' },
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