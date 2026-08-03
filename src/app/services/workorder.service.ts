import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {ISelect, IWorkOrder,IPageList, IVehicleType, IVehicleHistorySummary } from 'app/app.model';
import { environment } from 'environments/environment';
import { SharedService} from 'app/services/shared.service';
import { LogService } from './log.service';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class WorkOrderService {
  private baseUrl: string = environment.BASE_URL +  '/api/workorder';
  constructor(private http: HttpClient,private logger: LogService,private sharedService:SharedService) {
  }
  
  getWorkOrders(filters:FormGroup) {
    const queryString = this.sharedService.buildQueryParams(filters);
    const url = `${this.baseUrl}/list?${queryString}`;
    return this.http.get<IPageList<IWorkOrder>>(url);
  }

  /**
   * Every work order for a customer, regardless of date or count. There is no separate
   * list-by-customerid endpoint - this is `list`'s own customerId filter, with a wide date range to
   * bypass its default 1-year window, paging through every page since `list` caps pageSize at 100.
   */
  getWorkOrdersByCustomerId(customerId: number): Observable<IWorkOrder[]> {
    const pageSize = 100;
    const fetchPage = (page: number) => {
      const queryParams = new URLSearchParams();
      queryParams.append("wmsId", this.sharedService.wmsId);
      queryParams.append("customerId", customerId.toString());
      queryParams.append("fromDate", "1970-01-01");
      queryParams.append("toDate", "2099-12-31");
      queryParams.append("currentPage", page.toString());
      queryParams.append("pageSize", pageSize.toString());
      return this.http.get<IPageList<IWorkOrder>>(`${this.baseUrl}/list?${queryParams}`);
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

  getWorkOrder(offerId:number | undefined,customerId:number | undefined,workOrderId:number | undefined,isDuplicate:boolean = false)
  {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);
      if (offerId !== undefined && offerId !== null && offerId !== 0) 
        queryParams.append("offerId", offerId.toString());
      if (customerId !== undefined && customerId !== null && customerId !== 0) 
        queryParams.append("customerId", customerId.toString());
      if (workOrderId !== undefined && workOrderId !== null && workOrderId !== 0) 
        queryParams.append("workOrderId", workOrderId.toString());
      if (isDuplicate == true) 
        queryParams.append("duplicate", true.toString());
    
      const url = `${this.baseUrl}/detail?${queryParams}`;
    return this.http.get<IWorkOrder>(url);
  }

  createWorkOrder(workOrder:IWorkOrder){
    workOrder.wmsId = this.sharedService.wmsId;
    const headers = new HttpHeaders({'Content-Type': 'application/json',});
    return this.http.post<IWorkOrder>(`${this.baseUrl}/create-workorder`, workOrder, {headers});
  }

  updateWorkOrder(workOrder:IWorkOrder){
    workOrder.wmsId = this.sharedService.wmsId;
    const headers = new HttpHeaders({'Content-Type': 'application/json',});
    return this.http.put<IWorkOrder>(`${this.baseUrl}/update-workorder`, workOrder, {headers});
  }

  getVehiclePlates(prefix:string) {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);
    queryParams.append("prefix", prefix);
    return this.http.get<string[]>(`${this.baseUrl}/vehicleplates?${queryParams}`);
  }
  
  /** First-visit vs. returning-vehicle summary for a plate, including every distinct customer it's ever been booked under. */
  getVehicleHistory(vehiclePlate: string) {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);
    queryParams.append("vehiclePlate", vehiclePlate);
    return this.http.get<IVehicleHistorySummary>(`${this.baseUrl}/vehicle-history?${queryParams}`);
  }

}
