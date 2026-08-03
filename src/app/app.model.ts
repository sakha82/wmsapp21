export type PdfObject = 'workorder' | 'invoice' | 'offer';

export interface IVehicle {
  name: string,
  models: string[]
}
export interface ITranslate {
  tkey: string,
  en: string,
  sv: string
}

export interface WmsUser {
  Email: string,
  password: string,
  email: string,
  role: string,
  wmsId: string,
  displayName: string,
  country: string,
  token: string,
  userName:string
}
export interface ResetPassword {
  Email: string,
  token: string,
  newPassword: string
}
export interface ForgotPassword {
  Email: string
}

export interface IPageList<T> {
  pager: IPager;
  objectList: Array<T>;
  totalSum: number,
  totalNet: number,
  totalVat: number
}
export interface IPager {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalRecords: number;
  firstPage: number;
  sortBy: string;
  sortDir: number;
}
export interface ISelect {
  value: string;
  text: string;
}
export type SverityType = "success" | "secondary" | "warn" | "help" | "info" | "danger" | "primary" | "contrast" | null | undefined;
export interface IEnum {
  key: string;
  value: string;
  default: boolean;
  text: string;
}

export interface IEnums {
  country: string,
  lang: string,
  key: string;
  value: string;
  index: number;
  isdefault: boolean;
  text: string;
  sverity: string;
}

export interface IEmail {
  country: string,
  lang: string,
  objectName: string,
  wmsId: string,
  workshopName: string,
  id: string,
  emailTo: string,
  subject: string,
  customMessage: string
}
export interface ITokenClaims {
  country: string,
  lang: string,
  wmsId: string,
  workshopName: string,
  objectName: string,
  id: string
}

export interface IPdf {
  country: string;
  lang: string;
  wmsId: string;
  objectName: string;
  ids: string;
  templateName: string;
}


export interface IWeeklyCalendar {
  cYear: string;
  cWeek: number;
  cTime: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  mondayDate: string;
  tuesdayDate: string;
  wednesdayDate: string;
  thursdayDate: string;
  fridayDate: string;
  saturdayDate: string;
  sundayDate: string;
  mondayBookings: IWorkOrder[];
  tuesdayBookings: IWorkOrder[];
  wednesdayBookings: IWorkOrder[];
  thursdayBookings: IWorkOrder[];
  fridayBookings: IWorkOrder[];
  saturdayBookings: IWorkOrder[];
  sundayBookings: IWorkOrder[];
}

export interface IDailyCalendar {
  cDate: string,
  cTime: string,
  workOrders: IWorkOrder[],
}


export interface IDigitalService {
  wmsId: string;
  digitalServiceId: number;
  userId: string;
  serviceType: string;
  creationDate: string;
  serviceDate: string;
  nextServiceDate: string;
  vin: string;
  vehiclePlate?: string | null;
  vehicleMileage?: number | null;
  nextServiceVehicleMileage?: number | null;
  vehicleManufacturer?: string | null;
  vehicleModel?: string | null;
  vehicleYear?: number | null;
  invoiceId?: number | null;
  services: string;
  comments: string;
  workshopName: string;
  workshopAddress: string;
  workshopCity: string;
  telephone: string;
  email: string;
  fileAttached:number;

}
export interface ICustomer {
  wmsId: string;
  customerId: number;
  customerName: string;
  customerType: string;
  customerTag: number;
  organizationNo: string;
  vatId: string;
  invoiceCreditDays: number;
  careOf: string;
  customerAddress: string;
  customerPostNo: string;
  customerCity: string;
  customerCountry: string;
  isCreditAllowed: boolean;
  telephone: string;
  email: string;
  digitalServiceId: string;
  totalDue: number;
  totalPaid: number;
  totalOffers: number;
  totalAccepted: number;
  totalRejected: number;
  customerTagName: string;
  isEdit: boolean;
}
export interface IEmployee {
  wmsId: string,
  employeeId: number,
  personnumber: string,
  fullName: string,
  friendlyName: string,
  jobTitle: string,
  hireDate: string,
  terminationDate: string,
  monthlySalary: number,
  calendarColor: string,
  street: string,
  postNo: string,
  city: string,
  country: string,
  telephone: string,
  email: string,
  skills: string,
  certifications: string,
  isActive: boolean,
  includeInCalendarHours: boolean
}
export interface ITimesheet {
  wmsId: string,
  timesheetId: number,
  employeeId: number,
  employeeName: string,
  personalNumber: string,
  timesheetType: string,
  startDate: string,
  intervalId: number,
  timeIn:string,
  timeOut:string,
  isFullDay: boolean,
  isActive: boolean,
  comments: string,
  deleteComments: string,
  employee: IEmployee
}

export interface IFileUploadRequest {
  wmsId?: string;
  type: string; //allowed type = 'workorder'
  id: number;
  file: File;
}
export interface IFileUploadResponse {
  fileName: string;
  key: string;
  sizeInKb: string;
  lstModified: string;
}


export interface IInvoice {
  wmsId: string;
  invoiceId: number;
  customerId: number;
  customerName: string;
  customerEmail: string,
  digitalServiceId: string;
  invoiceDate: string;
  vehiclePlate: string;
  vehicleMileage: number;
  vehicleManufacturer: string;
  vehicleModel: string;
  vehicleYear: number;
  creditDays: number;
  dueDate: string;
  currency: string;
  yourRef: string;
  paymentType: string;
  paymentTypeLabel: string;
  paymentDate: string;
  price: number;
  vat: number;
  adjustment: number;
  priceIncVat: number;
  isSent: boolean;
  isPaid: boolean;
  totalPaid: number;
  remainingBalance: number;
  workshopName: string;
  priceMode: number;
  details: IInvoiceDetail[];
  payments: IInvoicePayment[];
  history: IInvoiceHistory[];
}
export interface IInvoiceDetail {
  wmsId: string;
  invoiceId: number;
  rowIndex: number;
  category: string;
  productId: number;
  product: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatPercentage: number;
  discountPercentage: number;
  price: number;
  vat: number;
  priceIncVat: number;
  textContent: string | null; //freetextfield
  isTextRow: boolean;
}



export interface IDetailTemplate {
  rowIndex: number;
  category: string;
  product: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatPercentage: number;
  discountPercentage: number;
  price: number;
  vat: number;
  priceIncVat: number;
  freeText: string | null; //freetextfield
  isTextRow: boolean;
}


export interface IInvoicePayment {
  wmsId: string;
  invoiceId: number;
  invoicePaymentId: number;
  paymentDate: string;
  paymentAmount: number;
  paymentNote: string;
}

export interface IInvoiceHistory {
  wmsId: string;
  invoiceId: number;
  createdOn: string;
  actionType: string;
  actionText: string;
}
export interface IOffer {
  wmsId: string;
  offerId: number;
  customerId: number;
  offerDate: string;
  vehiclePlate: string;
  vehicleMileage: number;
  vehicleManufacturer: string;
  vehicleModel: string;
  vehicleYear: number;
  validDays: number;
  validFrom: string;
  validTill: string;
  currency: string;
  yourRef: string;
  paymentType: string;
  price: number;
  vat: number;
  adjustment: number;
  priceIncVat: number;
  isSent: boolean;
  isAccepted: boolean;
  isRejected: boolean;
  acceptRejectDate: string;
  offerType: string;
  //offerTypeItems: MenuItem[],

  selectedOfferType: string;
  customerName: string;
  customerEmail: string,
  workshopName: string;
  priceMode: number;
  details: IOfferDetail[];
  history: IOfferHistory[];
}
export interface IOfferDetail {
  wmsId: string;
  offerId: number;
  rowIndex: number;
  category: string;
  product: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatPercentage: number;
  discountPercentage: number;
  price: number;
  vat: number;
  priceIncVat: number;
  freeText: string | null; //freetextfield
  isTextRow: boolean;
}

export interface IOfferHistory {
  wmsId: string;
  offerId: number;
  createdOn: string;
  actionType: string;
  actionText: string;
}
export interface ISale {
  wmsId: string,
  saleYear: number,
  saleMonth: number,
  turnover: number
}
import { MenuItem } from "primeng/api"

export interface IWorkOrder {
  wmsId: string,
  workOrderId: number,
  customerId: number,
  customerName: string,
  customerTelephone: string,
  customerEmail: string,
  workOrderDate: string,
  vehiclePlate: string,
  vehicleMileage: number,
  paymentType: string,
  workOrderStatus: string,
  description: string,
  customerNote: string,
  purchaseNote: string,
  offerId: number,
  employeeId: number,
  employeeName: string,
  bookingDate: string,
  bookingTime: string,
  purchaseCount: string,
  estimatedHours: string,
  serviceTypes: string,
  isActive: number,
  /** Vehicle record for vehiclePlate - make/model/year/oil info all come from here, not
   * stored redundantly on WorkOrder. Read-only, looked up server-side. */
  vehicle?: IVehicleDetails,
  /** Ids of the service categories selected for this work order (many-to-many). Write it to
   * change the selection on create/update, which replaces the whole set. */
  serviceCategoryIds: number[],
  /** Display names matching serviceCategoryIds, in the same order. Read-only. */
  serviceCategoryNames?: string[],
  // workOrderStatusItems: MenuItem[],
//deliveryDate: string,
  //deliveryTime: string,
}

export interface IServiceCategory {
  serviceId: number;
  serviceName: string;
}

export interface ISignup {
  wmsId: string;
  workshopName: string;
  contactPerson: string;
  telephone: string;
   userEmail: string;
   userPassword: string;
}
export interface IWorkshop {
  wmsId: string;
  workshopName: string;
  registrationId: string;
  vatId: string;
  workshopStreet: string;
  workshopPostNo: string;
  workshopCity: string;
  workshopCountry: string;
  telephone: string;
  email: string;
  bankgiro: string;
  swish: string;
  bic: string;
  iban: string;
  priceMode: number;
  isFskat: boolean;
  defaultLang: string;
  defaultTheme: string;
  defaultInvoiceTemplate: string;
  hourlyRate: number;
}
// Dashboard

/** "Today's Workshop" at-a-glance counters for the AI-workspace dashboard's stat tiles. */
export interface ITodayWorkshopSummary {
  arrivingToday: number;
  inWorkshop: number;
  /** Completed and still active, no date restriction - no separate "delivered" event is tracked. */
  readyForPickup: number;
  /** Union of: unpaid invoice, offer awaiting a decision 5+ days, or an open reminder that names the customer. */
  customersToContact: number;
  /** Work orders booked in for today with no mechanic assigned yet - backs the "missing mechanic assignments" AI Suggestion. */
  missingMechanicAssignments: number;
}

/** This calendar month's sale/target/order count - the Dashboard's "Sales this month" widget. */
export interface IMonthOverview {
  sale: number;
  saleTarget: number;
  orders: number;
}

/** A single AI-förslag suggestion card. */
export interface IDashboardSuggestion {
  severity: string;
  text: string;
  actionUrl?: string;
}

/** Single aggregate response backing the Dashboard's "Today's Workshop"/"AI-förslag"/"Sales this month" widgets. */
export interface IDashboardOverview {
  todayWorkshop: ITodayWorkshopSummary;
  currentMonth: IMonthOverview;
  aiSuggestions: IDashboardSuggestion[];
}
export interface ICustomerTag {
  wmsId: string;
  customerTagId: number;
  customerTagName: string;
  isDefault: boolean;
  customerCount: number;
}
export interface IWorkShopService {
  wmsId?: string;
  serviceName: string;
  serviceHours: number;
  workshopServiceId?: number;
}

export interface IMonthSummary {
  sale: number;
  orderCount: number;
}
export interface IWmsLog {
method:string;
controller:string;
action:string;
requestBody:string;
statusCode:number;
}

export interface IInvoicePromptRequest {
context?:string;
items: IInvoiceDetailPrompt[]
}
export interface IInvoiceDetailPrompt{
type:string;
name?:string;
description?:string;
quantity:number;
unit:string;
}

///// vehicle

export interface VehicleSearch{
  vehiclePlate: string;
  vehicleManufacturer?: string;
  vehicleModel?: string;
  vehicleYear?: number;
}
export interface VehicleSearchResponse {
  wmsId: string;
  vehiclePlate: string;

  // Vehicle Info
  vehicleManufacturer?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  latestVehicleMileage?: number;
  
  // Customer
  customerId?: number;
  customerName?: string;
  
  totalInvoiceCount: number;
  totalInvoiceAmount: number;
  paidInvoiceAmount: number;
  unpaidInvoiceAmount: number;
  paidInvoiceCount:number;
  unpaidInvoiceCount:number;
  partsSale:number;
  labourSale:number;
  suppliers:string;
  totalWorkOrderCount: number;
  totalWOPurchaseCount: number;
  totalOfferCount: number;
  totalDigitalServiceCount: number;
  dataPayload?: VehicleHierarchy;
  refreshedAt: string;
}

export interface VehicleHierarchy {
  customerId: number;
  customerName: string;
  invoices?: InvoiceDto[];
  workOrders?: WorkOrderDto[];
  offers?: OfferDto[];
  digitalServices?: DigitalServiceDto[];
}
export interface InvoiceDto {
  invoiceId: number;
  invoiceDate?: string;
  dueDate?: string;
  totalInvoiceAmount:number;
  labourSale:number;
  partsSale:number;
  paymentDate?: string;
  paymentAmount: number;
  remainingBalance: number;

}
export interface WorkOrderDto {
  workOrderId: number;
  bookingDate?: string;
  bookingTime?: string;
  employeeName?: string;
  workOrderStatus?: string;
  supplierPurchaseDetails?: string;
}
export interface OfferDto {
  offerId: number;
  offerDate?: string;
  priceIncVat?: number;
  isAccepted?: boolean;
  isRejected?: boolean;
}
export interface DigitalServiceDto {
  wmsId: string;
  userId: number;
  serviceDate: string;
  serviceType: string;
  vehicleMileage: number;
  services:string;
}
export interface IVehicleType{
  wmsId: string;
  make: string;
  model:string;
  category: string;
  segment: string;
  fuelType: string;
  isPremium: number;
  year: number;
}

export interface IVehicleDetails {
  vehicleId: string;
  vin: string;
  make: string;
  model: string;
  year: string;
  chassis: string;
  vehicleType: string;
  fuelType: string;
  engineCode: string;
  transmission: string;
  effect: string;
  horsepower: string;
  driving: string;
  color: string;
  frontWheelDimension: string;
  backWheelDimension: string;
  oilCapacity: string;
  oilSpecifications1: string;
  oilClassification1: string;
  oilSpecifications2: string;
  oilClassification2: string;
}

///// AI-assist (work order text-to-form parsing)

export interface IWorkOrderIntentRequest {
  transcript: string;
  wmsId: string;
  employeeId?: number;
}

export interface IWorkOrderIntentCandidate {
  id: number;
  label: string;
}

export interface IWorkOrderIntentServiceLine {
  productId?: number;
  productName: string;
  quantity?: number;
}

export interface IWorkOrderIntentResponse {
  vehiclePlate?: string;
  customerId?: number;
  customerName?: string;
  /** Populated instead of customerId when the text matched more than one customer. */
  customerCandidates?: IWorkOrderIntentCandidate[];
  employeeId?: number;
  employeeName?: string;
  serviceLines?: IWorkOrderIntentServiceLine[];
  /** The described work rewritten as a short, professional Swedish work order description. */
  professionalDescription?: string;
  /** Form control names the AI populated, so the UI can mark them "AI-suggested" until reviewed. */
  filledFields: string[];
}

///// Vehicle history (first-visit / returning-vehicle detection)

/** A distinct customer this vehicle plate has been booked under. A plate is not a reliable 1:1 proxy for a customer - the same registration can legitimately reappear under more than one customer over time. */
export interface IVehicleHistoryCustomer {
  customerId: number;
  customerName: string;
  customerTelephone?: string;
  customerEmail?: string;
}

///// Reminders

export interface IReminder {
  wmsId: string;
  reminderId: number;
  status: string;
  textContent: string;
  assignedToEmployeeId?: number;
  /** Assigned employee's full name. Read-only, looked up from assignedToEmployeeId. */
  assignedToEmployeeName?: string;
  customerId?: number;
  vehiclePlate?: string;
  createdOn?: string;
  createdBy?: string;
}

export interface ICreateReminderRequest {
  wmsId: string;
  textContent: string;
  assignedToEmployeeId?: number;
  customerId?: number;
  vehiclePlate?: string;
}

export interface IReminderIntentResponse {
  text: string;
  /** Resolved employee id, set only when exactly one employee matched the name mentioned. */
  assignedToEmployeeId?: number;
  assignedToEmployeeName?: string;
  /** Populated instead of assignedToEmployeeId when the transcript matched more than one employee - never guessed. */
  employeeCandidates?: IWorkOrderIntentCandidate[];
}

export interface IVehicleHistorySummary {
  isFirstVisit: boolean;
  lastVisitDate?: string;
  visitCount: number;
  previousServicesSummary?: string;
  /** Every distinct customer this plate has been booked under. Empty on a first visit; more than one entry means the caller must ask which customer this visit is for rather than guessing. */
  distinctCustomers: IVehicleHistoryCustomer[];
}
