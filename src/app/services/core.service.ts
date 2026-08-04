import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IEmail, IFileUploadRequest, IFileUploadResponse, IPdf, IServiceCategory, IVehicleDetails, VehicleSearch, VehicleSearchResponse } from 'app/app.model';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SharedService } from './shared.service';

/**
 * Wraps every `CoreController` endpoint (`/api/Core/*`) — vehicle lookups, email/PDF generation,
 * signup, and next-id allocation — plus the file-storage endpoints, which as of the MinIO cutover
 * live on `FileController` (`/api/File/*`) instead, not `CoreController`.
 */
@Injectable({ providedIn: 'root' })
export class CoreService {
  private coreUrl: string = environment.BASE_URL + '/api/Core';
  private fileUrl: string = environment.BASE_URL + '/api/File';

  constructor(private http: HttpClient, private sharedService: SharedService) {}

  uploadFile(uploadRequest: IFileUploadRequest) {
    const formData = new FormData();
    formData.append('wmsId', this.sharedService.wmsId);
    formData.append('type', uploadRequest.type);
    formData.append('id', uploadRequest.id.toString());
    formData.append('file', uploadRequest.file);

    return this.http.post<IFileUploadResponse>(`${this.fileUrl}/upload-file`, formData);
  }

  deleteFile(key: string) {
    return this.http.delete<boolean>(
      `${this.fileUrl}/delete-file?key=${encodeURIComponent(key)}`
    );
  }

  getVehicleList(vehiclePlate: string) {
    const queryParams = new URLSearchParams();
    queryParams.append('wmsId', this.sharedService.wmsId);
    queryParams.append('vehiclePlate', vehiclePlate);
    const url = `${this.coreUrl}/vehicle-list?${queryParams}`;
    return this.http.get<VehicleSearch>(url);
  }

  getVehicleInfo(vehiclePlate: string) {
    const queryParams = new URLSearchParams();
    queryParams.append('wmsId', this.sharedService.wmsId);
    queryParams.append('vehiclePlate', vehiclePlate);
    const url = `${this.coreUrl}/vehicle-info?${queryParams}`;
    return this.http.get<VehicleSearchResponse>(url);
  }

  getVehicle(registrationNumber?: string, vehicleId?: string) {
    const queryParams = new URLSearchParams();
    if (registrationNumber) queryParams.append('id', registrationNumber);
    const url = `${this.coreUrl}/vehicle?${queryParams}`;
    return this.http.get<IVehicleDetails>(url);
  }

  /** Global, tenant-free lookup - the service categories a work order can be tagged with. */
  getServiceCategories() {
    return this.http.get<IServiceCategory[]>(`${this.coreUrl}/service-categories`);
  }

  getPDFBlob(key: string): Observable<Blob> {
    const params = new HttpParams().set('key', key);
    return this.http.get(`${this.fileUrl}/download-file`, {
      params,
      responseType: 'blob'
    });
  }

  downloadFile(key: string): void {
    const params = new HttpParams().set('key', key);

    this.http.get(`${this.fileUrl}/download-file`, {
      params,
      responseType: 'blob',  // ensures we receive binary data
      observe: 'response'    // allows access to headers (e.g., file name)
    }).subscribe({
      next: (response) => {
        const blob = new Blob([response.body!], { type: response.body?.type });

        // Extract filename from Content-Disposition header if present
        let filename = key; // default fallback
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?([^"]+)"?/);
          if (match && match[1]) {
            filename = match[1];
          }
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading file:', error);
        // Show a user-friendly error if needed
      }
    });
  }

  /**
   * `FileController`'s list-files response is the `wms.file` metadata shape (`originalFileName`,
   * `storageKey`, `sizeInBytes`, `createdOn`, ...), not the old Azure-Blob-era `fileName`/`key`/
   * `sizeInKb`/`lstModified` shape this method's callers (and the work-order-detail template) still
   * expect - mapped here so those callers don't need to change.
   */
  listFiles(workOrderId: number) {
    const queryParams = new URLSearchParams();
    queryParams.append('wmsId', this.sharedService.wmsId);
    queryParams.append('type', 'workorder');
    queryParams.append('id', workOrderId.toString());
    return this.http.get<any[]>(`${this.fileUrl}/list-files?${queryParams}`).pipe(
      map(files => (files ?? []).map(f => ({
        fileName: f.originalFileName ?? f.fileName,
        key: f.storageKey ?? f.key,
        sizeInKb: f.sizeInBytes != null ? Math.round(f.sizeInBytes / 1024).toString() : f.sizeInKb,
        lstModified: f.createdOn ?? f.lstModified
      } as IFileUploadResponse)))
    );
  }

  sendEmail(objectName: string, id: number, emailTo: string, customMessage: string) {
    const email: IEmail = ({
      country: this.sharedService.country,
      lang: this.sharedService.lang,
      objectName: objectName,
      wmsId: this.sharedService.wmsId,
      workshopName: this.sharedService.workshopName,
      id: id.toString(),
      emailTo: emailTo,
      subject: '',
      customMessage: customMessage
    });
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<IEmail>(`${this.coreUrl}/send-email`, email, { headers });
  }

  printPdf(objectName: string, ids: string, templateName: string) {
    const pdf: IPdf = ({
      country: this.sharedService.country,
      lang: this.sharedService.lang,
      wmsId: this.sharedService.wmsId,
      objectName: objectName,
      ids: ids,
      templateName: templateName
    });
    return this.http.post(`${this.coreUrl}/pdf`, pdf, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf'
      },
      responseType: 'blob' as 'json' // Type assertion to satisfy Angular's HttpClient
    });
  }

  signup(signupData: any) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.coreUrl}/signup`, signupData, { headers });
  }

  getNextId(tableName: string) {
    const queryParams = new URLSearchParams();
    queryParams.append('wmsId', this.sharedService.wmsId);
    queryParams.append('tName', tableName);
    const url = `${this.coreUrl}/next-id?${queryParams}`;
    return this.http.get<number>(url);
  }
}
