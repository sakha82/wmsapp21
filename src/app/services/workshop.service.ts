import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ICustomerTag, ICustomerType, IProductTemplate, IWorkshop, IWorkShopService } from 'app/app.model';
import { IEnums, ISelect } from 'app/app.model';
import { environment } from 'environments/environment';
import { BehaviorSubject, catchError, firstValueFrom, Observable, tap } from 'rxjs';
import { LogService } from 'app/services/log.service';
import { SharedService } from 'app/services/shared.service';
import { IDetailTemplate } from 'app/app.model';

@Injectable({ providedIn: 'root' })
export class WorkshopService {

  baseUrl: string = environment.BASE_URL + "/api/workshop";
  baseUrl1: string = environment.BASE_URL + "/api/Product";

  constructor(private http: HttpClient, private logger: LogService, private sharedService: SharedService) { }

  getWorkshop() {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);

    const url = `${this.baseUrl}/detail?${queryParams}`;
    return this.http.get<IWorkshop>(url);
  }

  updateWorkshop(workshop: IWorkshop) {
    workshop.wmsId = this.sharedService.wmsId;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', });
    this.logger.info('Updating workshop with data:', workshop);
    return this.http.post<IWorkshop>(`${this.baseUrl}/update`, workshop, { headers });
  }

updateInvoiceSettings(priceMode:number,defaultTemplate:string) {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);
    queryParams.append("priceMode", priceMode.toString());
    queryParams.append("template", defaultTemplate);
    const url = `${this.baseUrl}/update-invoice-settings?${queryParams}`;
  
     return this.http.get<boolean>(url);
  }
  getCustomerTags() {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);
    const url = `${this.baseUrl}/customer-tags?${queryParams}`;
    return this.http.get<ICustomerTag[]>(url);
  }
  getCustomerTypes() {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);
    const url = `${this.baseUrl}/customer-types?${queryParams}`;
    return this.http.get<ICustomerType[]>(url);
  }
  upsertCustomerTag(customerTag: ICustomerTag) {
    customerTag.wmsId = this.sharedService.wmsId;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', });
    return this.http.post<ICustomerTag>(`${this.baseUrl}/upsert-customer-tag`, customerTag, { headers });
  }

  upsertCustomerType(customerType: ICustomerType) {
    customerType.wmsId = this.sharedService.wmsId;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', });
    return this.http.post<ICustomerType>(`${this.baseUrl}/upsert-customer-type`, customerType, { headers });
  }
  // getServices() {
  //   const queryParams = new URLSearchParams();
  //   queryParams.append("wmsId", this.sharedService.wmsId);
  //   const url = `${this.baseUrl}/workshop-services?${queryParams}`;
  //   return this.http.get<ICustomerType[]>(url);
  // }
  getServices(search:string): Observable<any> {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);
    queryParams.append("search", search);
    const url = `${this.baseUrl}/workshop-services?${queryParams}`;
    return this.http.get(url);
    // .pipe(
    //   tap((response: any) => {
    //     response; 
    //   })
    // );
  }
  upsertWorkshopService(service: IWorkShopService): Observable<IWorkShopService> {
    service.wmsId = this.sharedService.wmsId;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IWorkShopService>(`${this.baseUrl}/upsert-workshop-services`, service, { headers });
  }
  deleteWorkshopService(wmsId: string, workshopServiceId: number) {
    const queryParams = new URLSearchParams();
    queryParams.append('wmsId', wmsId);
    queryParams.append('workshopServiceId', workshopServiceId.toString()); // convert to string for URL

    const url = `${this.baseUrl}/delete-workshop-service?${queryParams.toString()}`;
    return this.http.post(url, {});
  }
  deleteCustomerTag(customerTagId: number) {
    const queryParams = new URLSearchParams();
    queryParams.append('wmsId', this.sharedService.wmsId);
    queryParams.append('customerTagId', customerTagId.toString()); // convert to string for URL

    const url = `${this.baseUrl}/delete-customer-tag?${queryParams.toString()}`;
    return this.http.delete(url, {});
  }
  deleteCustomerType(customerTypeId: number) {
    const queryParams = new URLSearchParams();
    queryParams.append('wmsId', this.sharedService.wmsId);
    queryParams.append('customerTypeId', customerTypeId.toString()); // convert to string for URL

    const url = `${this.baseUrl}/delete-customer-type?${queryParams.toString()}`;
    return this.http.delete(url, {});
  }


  isWorkshopServiceExists(serviceName: string): Observable<boolean> {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);
    queryParams.append("serviceName", serviceName);

    const url = `${this.baseUrl}/is-workshop-service-exists?${queryParams}`;
    return this.http.get<boolean>(url);
  }

  // 🔹 List files for workshop
  listFiles(type: string = 'logo'): Observable<any> {
    const queryParams = new URLSearchParams();
    queryParams.append('wmsid', this.sharedService.wmsId); 
    queryParams.append('type', type);

    const url = `${environment.BASE_URL}/api/File/list-files?${queryParams.toString()}`;
    return this.http.get(url);
  }


  // 🔹 Download file by key
  downloadFile(key: string): Observable<Blob> {
    const queryParams = new URLSearchParams();
    queryParams.append('key', key);

    const url = `${environment.BASE_URL}/api/File/download-file?${queryParams.toString()}`;
    return this.http.get(url, { responseType: 'blob' });
  }
  uploadFile(file: File, type: string = 'logo'): Observable<any> {
    const wmsId = this.sharedService.wmsId;
    const url = `${environment.BASE_URL}/api/File/upload-file`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('wmsid', wmsId);
    formData.append('type', type);

    return this.http.post(url, formData);
  }


  //ProductTemplates

    getProductTemplates() {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);
    const url = `${this.baseUrl1}/templates?${queryParams}`;
    return this.http.get<IProductTemplate[]>(url);
  }


    upsertProductTemplates(productTemplate: IProductTemplate) {
    productTemplate.wmsId = this.sharedService.wmsId;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', });
    return this.http.post<IProductTemplate>(`${this.baseUrl1}/upsert-template`, productTemplate, { headers });
  }

  deleteProductTemplate(productTemplateId: number) {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);
    queryParams.append("productTemplateId", productTemplateId.toString());
    const url = `${this.baseUrl1}/delete-template?${queryParams}`;
    return this.http.delete(url);
  }

}

