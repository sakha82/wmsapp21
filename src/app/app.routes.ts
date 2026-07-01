import { Routes } from '@angular/router';
import { ResourcesLoadedGuard } from 'app/guards/resourcesloaded.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('app/components/home/home/home.component').then((m) => m.HomeComponent),
    data: { preload: true },
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('app/components/privacypolicy/privacypolicy.component').then(
        (m) => m.PrivacypolicyComponent
      ),
    data: { preload: true },
  },
  {
    path: 'opt-out',
    loadComponent: () =>
      import('app/components/opt-out/opt-out.component').then((m) => m.OptOutComponent),
    data: { preload: true },
  },
  {
    path: 'webview/offer',
    loadComponent: () =>
      import('app/components/webview/offer-view/offer-view.component').then(
        (m) => m.OfferViewComponent
      ),
  },
  {
    path: 'webview/invoice',
    loadComponent: () =>
      import('app/components/webview/invoice-view/invoice-view.component').then(
        (m) => m.InvoiceViewComponent
      ),
  },
  {
    path: 'webview/digitalservice',
    loadComponent: () =>
      import('app/components/webview/digitalservice-view/digitalservice-view.component').then(
        (m) => m.DigitalServiceViewComponent
      ),
  },
  {
    path: 'webview/resetpassword',
    loadComponent: () =>
      import('app/components/webview/password-reset/resetpassword-view.component').then(
        (m) => m.ResetPasswordViewComponent
      ),
  },
  {
    path: 'webview/forgetpassword',
    loadComponent: () =>
      import('app/components/webview/password-forget/forgetpassword-view.component').then(
        (m) => m.ForgetPasswordViewComponent
      ),
  },
  {
    path: 'sv',
    loadComponent: () =>
      import('app/components/layout/app-layout/layout.component').then((m) => m.LayoutComponent),
    canActivate: [ResourcesLoadedGuard],
    data: { preload: 'delay' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('app/components/dashboard/dashboard-list/dashboard-list.component').then(
            (m) => m.DashboardListComponent
          ),
      },
      {
        path: 'customer',
        loadComponent: () =>
          import('app/components/customer/customer-list/customer-list.component').then(
            (m) => m.CustomerListComponent
          ),
      },
      {
        path: 'customer/details/:customerId',
        loadComponent: () =>
          import('app/components/customer/customer-detail/customer-detail.component').then(
            (m) => m.CustomerDetailComponent
          ),
      },
      {
        path: 'customer/crud',
        loadComponent: () =>
          import('app/components/customer/customer-crud/customer-crud.component').then(
            (m) => m.CustomerCrudComponent
          ),
      },
      {
        path: 'offer',
        loadComponent: () =>
          import('app/components/offer/offer-list/offer-list.component').then(
            (m) => m.OfferListComponent
          ),
      },
      {
        path: 'offer/details/:id',
        loadComponent: () =>
          import('app/components/offer/offer-detail/offer-detail.component').then(
            (m) => m.OfferDetailComponent
          ),
      },
      {
        path: 'offer/crud',
        loadComponent: () =>
          import('app/components/offer/offer-crud/offer-crud.component').then(
            (m) => m.OfferCrudComponent
          ),
      },
      {
        path: 'invoice',
        loadComponent: () =>
          import('app/components/invoice/invoice-list/invoice-list.component').then(
            (m) => m.InvoiceListComponent
          ),
      },
      {
        path: 'invoice/details/:id',
        loadComponent: () =>
          import('app/components/invoice/invoice-detail/invoice-detail.component').then(
            (m) => m.InvoiceDetailComponent
          ),
      },
      {
        path: 'invoice/crud',
        loadComponent: () =>
          import('app/components/invoice/invoice-crud/invoice-crud.component').then(
            (m) => m.InvoiceCrudComponent
          ),
      },
      {
        path: 'workorder',
        loadComponent: () =>
          import('app/components/workorder/workorder-list/workorder-list.component').then(
            (m) => m.WorkOrderListComponent
          ),
      },
      {
        path: 'workorder/details/:workOrderId',
        loadComponent: () =>
          import('app/components/workorder/workorder-detail/workorder-detail.component').then(
            (m) => m.WorkOrderDetailComponent
          ),
      },
      {
        path: 'workorder/crud',
        loadComponent: () =>
          import('app/components/workorder/workorder-crud/workorder-crud.component').then(
            (m) => m.WorkOrderCrudComponent
          ),
      },
      {
        path: 'digitalservice',
        loadComponent: () =>
          import('app/components/digitalservice/digitalservice-list/digitalservice-list.component').then(
            (m) => m.DigitalServiceListComponent
          ),
      },
      {
        path: 'digitalservice/details/:vehiclePlate/:userId',
        loadComponent: () =>
          import('app/components/digitalservice/digitalservice-detail/digitalservice-detail.component').then(
            (m) => m.DigitalServiceDetailComponent
          ),
      },
      {
        path: 'product',
        loadComponent: () =>
          import('app/components/product/product-list/product-list.component').then(
            (m) => m.ProductListComponent
          ),
      },
      {
        path: 'product/details/:id',
        loadComponent: () =>
          import('app/components/product/product-list/product-detail/product-detail.component').then(
            (m) => m.ProductDetailComponent
          ),
        data: { seo: 'product-detail' },
      },
      {
        path: 'supplier',
        loadComponent: () =>
          import('app/components/supplier/supplier-list/supplier-list.component').then(
            (m) => m.SupplierListComponent
          ),
      },
      {
        path: 'employee',
        loadComponent: () =>
          import('app/components/employee/employee-list/employee-list.component').then(
            (m) => m.EmployeeListComponent
          ),
      },
      {
        path: 'employee/crud',
        loadComponent: () =>
          import('app/components/employee/employee-crud/employee-crud.component').then(
            (m) => m.EmployeeCrudComponent
          ),
      },
      {
        path: 'employee/crud/:id',
        loadComponent: () =>
          import('app/components/employee/employee-crud/employee-crud.component').then(
            (m) => m.EmployeeCrudComponent
          ),
      },
      {
        path: 'employment',
        loadComponent: () =>
          import('app/components/employee/timesheet/timesheet-list.component').then(
            (m) => m.TimesheetListComponent
          ),
      },
      {
        path: 'booking',
        loadComponent: () =>
          import('app/components/booking/booking-list/booking-list.component').then(
            (m) => m.BookingListComponent
          ),
      },
      {
        path: 'setting',
        loadComponent: () =>
          import('app/components/setting/setting-crud.component').then(
            (m) => m.SettingCrudComponent
          ),
      },
      {
        path: 'vehicle',
        loadComponent: () =>
          import('app/components/vehicle/vehicle-list/vehicle-list.component').then(
            (m) => m.VehicleListComponent
          ),
      },
    ],
  },
];
