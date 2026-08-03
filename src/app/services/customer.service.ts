import { inject,Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IPageList, IEnum } from 'app/app.model';
import { ICustomer, ICustomerTag } from 'app/app.model';
import { environment } from 'environments/environment';
import { FormGroup } from '@angular/forms';
import { LogService } from 'app/services/log.service';
import { SharedService } from './shared.service';
import { map } from 'rxjs/operators';


@Injectable({providedIn: 'root'})

export class CustomerService {
  private baseUrl: string = environment.BASE_URL +  '/api/customer';
  constructor(private http: HttpClient,private logger: LogService,private sharedService:SharedService) {}

  getCustomers(filters:FormGroup) {
    const queryString = this.sharedService.buildQueryParams(filters);
    const url = `${this.baseUrl}/list?${queryString}`;
    return this.http.get<IPageList<ICustomer>>(url);
  }
 
  getCustomer(customerId:number | undefined)
  {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);
    if (customerId !== undefined && customerId > 0) 
        queryParams.append("customerId", customerId.toString());
      const url = `${this.baseUrl}/detail?${queryParams}`;
      return this.http.get<ICustomer>(url);
  }

getCustomerName(customerId:number) {
  const queryParams = new URLSearchParams();
  queryParams.append("wmsId", this.sharedService.wmsId);
  queryParams.append("customerId", customerId.toString());
  const url = `${this.baseUrl}/customer-name?${queryParams}`;
  return this.http.get<{customerName: string }>(url);
}

  getCustomerByPrefix(prefix:string) {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);
    queryParams.append("prefix", prefix);
    return this.http.get<ICustomer[]>(`${this.baseUrl}/customers-by-prefix?${queryParams}`);
  }


getCustomerTags() {
  const queryParams = new URLSearchParams();
  queryParams.append("wmsId", this.sharedService.wmsId);
  return this.http.get<ICustomerTag[]>(`${this.baseUrl}/customer-tags?${queryParams}`);
}

getCustomerCities(filters:FormGroup) {
  const queryString = this.sharedService.buildQueryParams(filters);
  return this.http.get<string[]>(`${this.baseUrl}/customer-cities?${queryString}`);
}
/** There is no separate is-customer-exists endpoint - this reuses customers-by-prefix (an exact name is also a valid prefix) and matches client-side, case-insensitive. */
isCustomerExists(customerName:string) {
  const name = customerName.trim().toLowerCase();
  return this.getCustomerByPrefix(customerName.trim()).pipe(
    map((customers) => customers.some((c) => c.customerName?.trim().toLowerCase() === name))
  );
}

createCustomer(customer: ICustomer) {
    customer.wmsId = this.sharedService.wmsId;
    const headers = new HttpHeaders({'Content-Type': 'application/json',});
    return this.http.post<ICustomer>(`${this.baseUrl}/create-customer`, customer, {headers});
  }

  updateCustomer(customer: ICustomer) {
    customer.wmsId = this.sharedService.wmsId;
    const headers = new HttpHeaders({'Content-Type': 'application/json',});
    return this.http.put<ICustomer>(`${this.baseUrl}/update-customer`, customer, {headers});
  }

  saveCustomer(customer: ICustomer) {
    return (!customer.customerId || customer.customerId <= 0)
      ? this.createCustomer(customer)
      : this.updateCustomer(customer);
  }

  createCustomerTag(customerTag: ICustomerTag) {
    customerTag.wmsId = this.sharedService.wmsId;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', });
    return this.http.post<ICustomerTag>(`${this.baseUrl}/create-customer-tag`, customerTag, { headers });
  }

  updateCustomerTag(customerTag: ICustomerTag) {
    customerTag.wmsId = this.sharedService.wmsId;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', });
    return this.http.put<ICustomerTag>(`${this.baseUrl}/update-customer-tag`, customerTag, { headers });
  }

  saveCustomerTag(customerTag: ICustomerTag) {
    return (!customerTag.customerTagId || customerTag.customerTagId <= 0)
      ? this.createCustomerTag(customerTag)
      : this.updateCustomerTag(customerTag);
  }

  deleteCustomerTag(customerTagId: number) {
    const queryParams = new URLSearchParams();
    queryParams.append('wmsId', this.sharedService.wmsId);
    queryParams.append('customerTagId', customerTagId.toString());

    const url = `${this.baseUrl}/delete-customer-tag?${queryParams.toString()}`;
    return this.http.delete(url, {});
  }

  sumByCustomer(customerId: number) {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);
    queryParams.append("customerId", customerId.toString());
    const url = `${this.baseUrl}/sum-by-customer?${queryParams}`;
    return this.http.get<{
      offer: { total: number, accepted: number, rejected: number },
      invoice: { total: number, paid: number, balance: number }
    }>(url);
  }
}



