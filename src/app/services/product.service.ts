import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { IInventory, IInvoiceDetail, IPageList, IProductChart, IProductTemplate, ISelect, } from 'app/app.model';
import { IWorkshop, ICustomer, IProduct } from 'app/app.model';
import { environment } from 'environments/environment';
import { FormGroup } from '@angular/forms';
import { LogService } from 'app/services/log.service';
import { SharedService } from './shared.service';
import { catchError, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
  wmsId: string = '';
  country: string = '';
  lang: string = '';
  private baseUrl: string = environment.BASE_URL + '/api/product';
  constructor(private http: HttpClient, private logger: LogService, private sharedService: SharedService) { }

  getProducts(filters: FormGroup) {
    const queryString = this.sharedService.buildQueryParams(filters);
    const url = `${this.baseUrl}/list?${queryString}`;
    return this.http.get<IProduct[]>(url);
  }
  getProductsByCategory(category: string) {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);  
    queryParams.append("category", category);
    queryParams.append("includeBase", true.toString());
    const url = `${this.baseUrl}/list?${queryParams}`;
    return this.http.get<IProduct[]>(url);
  
  }

  getProduct(productId: number | undefined) {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);
    if (productId !== undefined && productId > 0)
      queryParams.append("productId", productId.toString());
    const url = `${this.baseUrl}/detail?${queryParams}`;
    return this.http.get<any>(url);
  }

  getProductsByprefix(category:string,prefix: string, make: string, model: string, year: number) {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);
    queryParams.append("category", category);
    queryParams.append("prefix", prefix);
    queryParams.append("make", make ?? '');
    queryParams.append("model", model ?? '');
    queryParams.append("year", (year ?? 0).toString());
    return this.http.get<IProduct[]>(`${this.baseUrl}/products-by-prefix?${queryParams}`);
  }

  createProduct(product: IProduct) {
    product.wmsId = this.sharedService.wmsId;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', });
    return this.http.post<IProduct>(`${this.baseUrl}/create-product`, product, { headers });
  }

  updateProduct(product: IProduct) {
    product.wmsId = this.sharedService.wmsId;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', });
    return this.http.put<IProduct>(`${this.baseUrl}/update-product`, product, { headers });
  }

  saveProduct(product: IProduct) {
    return (!product.productId || product.productId <= 0)
      ? this.createProduct(product)
      : this.updateProduct(product);
  }
  upsertInventory(inventory: IInventory) {
    inventory.wmsId = this.sharedService.wmsId;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', });
    return this.http.post<IInventory>(`${this.baseUrl}/insert-inventory`, inventory, { headers });

  }

  deleteProduct(productId: number) {
    const url = `${this.baseUrl}/${this.sharedService.wmsId}/${productId}`;
    return this.http.delete<boolean>(url);
  }
  isProductExists(wmsId: string, productName: string) {
    const queryParams = new URLSearchParams();
    queryParams.append('wmsId', wmsId);
    queryParams.append('productName', productName);

    const url = `${environment.BASE_URL}/api/Product/is-product-exists?${queryParams.toString()}`;
    return this.http.get<boolean>(url);
  }
  // Templates 
  getDetailTemplates() {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);
    const url = `${this.baseUrl}/templates?${queryParams}`;
    return this.http.get<IProductTemplate[]>(url);
  }

  getDetailTemplate(templateId: number) {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);
    queryParams.append("productTemplateId", templateId.toString());
    const url = `${this.baseUrl}/template-detail?${queryParams}`;
    return this.http.get<IProduct[]>(url);
  }

  getTemplates(wmsId: string) {
    const url = `${this.baseUrl}/template/list?wmsId=${wmsId}`;
    return this.http.get<any>(url);
  }

  getProductTemplates() {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);
    const url = `${this.baseUrl}/templates?${queryParams}`;
    return this.http.get<IProductTemplate[]>(url);
  }

  createProductTemplate(productTemplate: IProductTemplate) {
    productTemplate.wmsId = this.sharedService.wmsId;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', });
    return this.http.post<IProductTemplate>(`${this.baseUrl}/create-template`, productTemplate, { headers });
  }

  updateProductTemplate(productTemplate: IProductTemplate) {
    productTemplate.wmsId = this.sharedService.wmsId;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', });
    return this.http.put<IProductTemplate>(`${this.baseUrl}/update-template`, productTemplate, { headers });
  }

  saveProductTemplate(productTemplate: IProductTemplate) {
    return (!productTemplate.productTemplateId || productTemplate.productTemplateId <= 0)
      ? this.createProductTemplate(productTemplate)
      : this.updateProductTemplate(productTemplate);
  }

  deleteProductTemplate(productTemplateId: number) {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);
    queryParams.append("productTemplateId", productTemplateId.toString());
    const url = `${this.baseUrl}/delete-template?${queryParams}`;
    return this.http.delete(url);
  }

 
 
  getInventories(filters: FormGroup) {
    const queryString = this.sharedService.buildQueryParams(filters);
    const url = `${this.baseUrl}/list-inventory?${queryString}`;
    return this.http.get<IPageList<IInventory>>(url);
  }



  getProductTemplateDetail(productTemplateId: number): Observable<any> {
    let params = new HttpParams()
      .set('wmsId', this.sharedService.wmsId)
      .set('productTemplateId', productTemplateId.toString());
    return this.http.get<any>(this.baseUrl + '/template-detail', { params: params });
  }
  getProductChart(productId: number) {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);
    queryParams.append("productId", productId.toString());
    const url = `${this.baseUrl}/sale-chart?${queryParams.toString()}`;
    return this.http.get<IProductChart[]>(url);
  }

  getProductSaleHistory(productId: number) {
    const queryParams = new URLSearchParams();
    queryParams.append("wmsId", this.sharedService.wmsId);
    queryParams.append("productId", productId.toString());
    const url = `${this.baseUrl}/sale-history?${queryParams.toString()}`;
    return this.http.get<IInvoiceDetail[]>(url);
  }
setProductStatus(wmsId: string, productId: number, isActive: boolean) {
  return this.http.get(`${this.baseUrl}/set-product-status`, {
    params: { wmsId, productId, isActive: isActive.toString() }
  });
}
}