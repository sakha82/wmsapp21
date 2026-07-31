import { Injectable } from '@angular/core';
import { IVehicleDetails, IVehicleHistoryCustomer, IVehicleHistorySummary } from 'app/app.model';

export interface IWorkOrderHandoff {
  vehiclePlate: string;
  vehicleInfo: IVehicleDetails;
  vehicleHistory: IVehicleHistorySummary;
  customer?: IVehicleHistoryCustomer;
}

/**
 * One-shot in-memory handoff from the Dashboard's Registration-mode booking flow to the Create Work Order page -
 * the receptionist already looked up the plate/customer on the Dashboard, so that page shouldn't ask again. Per
 * DashboardPage_Redesign.md, users always arrive at Create Work Order via this handoff now (the AI-assist input
 * was removed from that page for the same reason). Consumed once and cleared immediately, so a direct visit to
 * the Create Work Order page later in the session doesn't accidentally reuse stale data.
 */
@Injectable({ providedIn: 'root' })
export class WorkOrderHandoffService {
  private pending: IWorkOrderHandoff | null = null;

  setPending(data: IWorkOrderHandoff): void {
    this.pending = data;
  }

  consumePending(): IWorkOrderHandoff | null {
    const data = this.pending;
    this.pending = null;
    return data;
  }
}
