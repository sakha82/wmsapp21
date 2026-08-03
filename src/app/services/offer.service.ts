import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { IPageList,IOffer, IInvoice, IWorkOrder, IOfferDetail, IEmail, IOfferHistory} from 'app/app.model';
import { FormGroup } from '@angular/forms';
import { LogService } from './log.service';
import { SharedService } from './shared.service';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';


@Injectable({ providedIn: 'root' }) 

export class OfferService {
 
 private baseUrl: string = environment.BASE_URL +  '/api/offer';
 constructor(private http: HttpClient,private logger: LogService,private sharedService:SharedService) {}
   
 getOffers(filters:FormGroup) {
    const queryString = this.sharedService.buildQueryParams(filters);
    const url = `${this.baseUrl}/list?${queryString}`;
    return this.http.get<IPageList<IOffer>>(url);
  }

  getOffer(offerId:number | undefined,customerId:number | undefined,duplicate:boolean = false)
  {
    this.logger.info('offerId=' + offerId + 'customerId=' + customerId + 'duplicate=' + duplicate);
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);

      if (offerId !== undefined && offerId > 0) 
        queryParams.append("offerId", offerId.toString());
      if (customerId !== undefined && customerId > 0) 
        queryParams.append("customerId", customerId.toString());
      
      queryParams.append("duplicate", duplicate.toString());  
      const url = `${this.baseUrl}/detail?${queryParams}`;
      return this.http.get<any>(url);
  } 
  /**
   * Every offer for a customer, regardless of date or count. There is no separate
   * list-by-customerid endpoint - this is `list`'s own customerId filter, with a wide date range to
   * bypass its default 1-year window and a large pageSize (paging through more if somehow needed).
   */
  getOffersByCustomerId(customerId: number): Observable<IOffer[]> {
    const pageSize = 10000;
    const fetchPage = (page: number) => {
      const queryParams = new URLSearchParams();
      queryParams.append("wmsId", this.sharedService.wmsId);
      queryParams.append("customerId", customerId.toString());
      queryParams.append("fromDate", "1970-01-01");
      queryParams.append("toDate", "2099-12-31");
      queryParams.append("currentPage", page.toString());
      queryParams.append("pageSize", pageSize.toString());
      return this.http.get<IPageList<IOffer>>(`${this.baseUrl}/list?${queryParams}`);
    };

    return fetchPage(1).pipe(
      switchMap((firstPage) => {
        if (firstPage.pager.totalPages <= 1) {
          return of(firstPage.objectList);
        }
        const remainingPages = Array.from({ length: firstPage.pager.totalPages - 1 }, (_, i) => fetchPage(i + 2));
        return forkJoin(remainingPages).pipe(
          map((pages) => [firstPage.objectList, ...pages.map((p) => p.objectList)].flat())
        );
      })
    );
  }
  createOffer(offer: IOffer) {
    offer.wmsId = this.sharedService.wmsId;
    offer.details.forEach(dtl => {dtl.wmsId = this.sharedService.wmsId;dtl.offerId = offer.offerId;});
    const headers = new HttpHeaders({'Content-Type': 'application/json',});
    return this.http.post<IOffer>(`${this.baseUrl}/create-offer`, offer, {headers});
  }

  updateOffer(offer: IOffer) {
    offer.wmsId = this.sharedService.wmsId;
    offer.details.forEach(dtl => {dtl.wmsId = this.sharedService.wmsId;dtl.offerId = offer.offerId;});
    const headers = new HttpHeaders({'Content-Type': 'application/json',});
    return this.http.put<IOffer>(`${this.baseUrl}/update-offer`, offer, {headers});
  }

  /**
   * Marks an offer as sent. There is no separate set-as-delivered endpoint - this fetches the full
   * offer (list rows don't carry Details, and update-offer replaces Details wholesale, so a round
   * trip through the detail endpoint is required to avoid wiping the offer's line items), flips
   * isSent, and calls the normal update.
   */
  markAsSent(offerId: number) {
    return this.getOffer(offerId, undefined).pipe(
      switchMap((res: any) => {
        const offer: IOffer = res.data;
        offer.isSent = true;
        return this.updateOffer(offer);
      })
    );
  }

  getOfferHistory(offerId:number) {
    const queryParams = new URLSearchParams();
    queryParams.append("country", this.sharedService.country);
    queryParams.append("lang", this.sharedService.lang);
    queryParams.append("wmsId", this.sharedService.wmsId);
    queryParams.append("offerId", offerId.toString());
    const url = `${this.baseUrl}/history?${queryParams}`;
    return this.http.get<IOfferHistory[]>(url);
  }

  getVehiclePlates(prefix:string) {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);
    queryParams.append("prefix", prefix);
    return this.http.get<Array<string>>(`${this.baseUrl}/vehicleplates?${queryParams}`);
  }
  offerSumByCustomer(customerId: number) {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);
    queryParams.append("customerId", customerId.toString());
    const url = `${this.baseUrl}/sum-by-customer?${queryParams}`;
    return this.http.get<{total:number,accepted:number,rejected:number}>(url);
  }

  
}
