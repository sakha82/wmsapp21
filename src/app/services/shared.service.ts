import { Injectable } from '@angular/core';
import{ ITranslate, IVehicle, IVehicleType} from 'app/app.model'
import { IEnums } from 'app/app.model';
import { BehaviorSubject, catchError, forkJoin, from, map, Observable, of, tap, finalize } from 'rxjs';
import { LogService } from './log.service';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Injectable({providedIn: 'root'})

export class SharedService {

  private pageHeadingSubject = new BehaviorSubject<string>('');  
  pageHeading$ = this.pageHeadingSubject.asObservable();
  
  resourceFileVersion: number = 1;
  enums: IEnums[] = [];  
  jobs: any[] = [];  
  private resourcesLoadedSubject = new BehaviorSubject<boolean>(false);
  resourcesLoaded$ = this.resourcesLoadedSubject.asObservable();
  private resourceLoadingPromise: Promise<void> | null = null;
  allManufacturers!: IVehicle[];
  allVehicleTypes: IVehicleType[] = [];
  translations!: ITranslate[];
  
  

  constructor(private http: HttpClient
              ,private logger: LogService,
              private router: Router, private route: ActivatedRoute
              ) {}

  get wmsId(): string {
    const wmsId = sessionStorage.getItem('wmsId') || '';
    if (!wmsId) this.logger.warn('Missing wmsId');
    return wmsId;
  }
  get workshopName(): string {
    const workshopName = sessionStorage.getItem('workshopName') || '';
    if (!workshopName) this.logger.warn('Missing workshopname');
    return workshopName;
  }
  get country(): string {
    const country = sessionStorage.getItem('country') || '';
    if (!country) this.logger.warn('Missing country');
    return country;
  }
  get currentLocale(): string {
    const country = sessionStorage.getItem('country') || '';
    if(country === 'se') return 'sv-SE';
    if(country === 'dk') return 'da-DK';
    return 'en-US'; // default to English if no country is set
  }
get lang(): 'en' | 'sv' {
  const lang = sessionStorage.getItem('lang') || '';
  if (!lang) {
    this.logger.warn('Missing Language');
  }

  // Validate the language value
  if (lang === 'en' || lang === 'sv') {
    return lang; // Return the valid language
  } else {
    this.logger.warn(`Invalid language: ${lang}, defaulting to 'en'`);
    return 'sv'; // Default to 'en' if the value is invalid
  }
}
  // shared method
  buildQueryParams(filters: FormGroup,includeWmsId:boolean = true): string {
    const queryParams = new URLSearchParams();
    if(includeWmsId)
      queryParams.append("wmsId", this.wmsId);
    Object.keys(filters.controls).forEach((key) => {
      const value = filters.get(key)?.value;
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    return queryParams.toString();
  }
  
  updateFiltersFromQueryParams(filters: FormGroup, params: any): void {
    Object.keys(params).forEach((key) => {
      if (params[key] && filters.contains(key)) {
        filters.patchValue({ [key]: params[key] });
      }
    });
  }
  updateFiltersInNavigation(filters: FormGroup): void {
  const filterValues = filters.getRawValue();

  // Filter out keys with empty, null, or undefined values
  const filteredParams = Object.keys(filterValues).reduce((params, key) => {
    if (filterValues[key] !== null && filterValues[key] !== undefined && filterValues[key] !== '') {
      params[key] = filterValues[key];
    }
    return params;
  }, {} as any);

  // Navigate with the filtered query parameters
  this.router.navigate([], {
    relativeTo: this.route,
    queryParams: filteredParams,
    queryParamsHandling: 'merge', // Merge with existing query parameters
  });
}

  // Transform IVehicleType array into hierarchical IVehicle structure
  private transformModelsToVehicles(vehicleTypes: IVehicleType[]): IVehicle[] {
    const manufacturersMap = new Map<string, Set<string>>();
    
    // Group models by manufacturer
    vehicleTypes.forEach((vehicle: IVehicleType) => {
      const make = vehicle.make;
      const model = vehicle.model;
      
      if (!manufacturersMap.has(make)) {
        manufacturersMap.set(make, new Set<string>());
      }
      manufacturersMap.get(make)?.add(model);
    });
    
    // Convert map to IVehicle array
    const result: IVehicle[] = [];
    manufacturersMap.forEach((models, make) => {
      result.push({
        name: make,
        models: Array.from(models).sort((a, b) => a.localeCompare(b))
      });
    });
    
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }

  getVehicleManufacturers(query:string):any[]
  {
    return this.allManufacturers  
    .map(m => m.name)
    .filter(vehicle => vehicle.startsWith(query))
    .sort((a, b) => a.localeCompare(b))??[];
  }
  // getVehicleModels(manufactuererName:string,query:string)
  // {
  //   let models:string[] = []
  //   if(manufactuererName)
  //   {
  //     models = this.allManufacturers.find(v => v.name === manufactuererName)?.models.sort((a, b) => a.localeCompare(b))  ?? [];
  //   }
  //   else 
  //   {
  //     models = [...this.allManufacturers.flatMap(m => m.models)];
  //   }  
  //   return models.filter(m => m.startsWith(query)).sort((a, b) => a.localeCompare(b)); 
  // }

  getVehicleType(make: string, model: string): IVehicleType | undefined {
    return this.allVehicleTypes.find(v => 
      v.make.toLowerCase() === make.toLowerCase() && 
      v.model.toLowerCase() === model.toLowerCase()
    );
  }

  registerVehicleModel(vehicleType: IVehicleType): string[] {
    const exists = this.allVehicleTypes.some(
      (v) =>
        v.make.toLowerCase() === vehicleType.make.toLowerCase() &&
        v.model.toLowerCase() === vehicleType.model.toLowerCase()
    );
    if (!exists) {
      this.allVehicleTypes.push(vehicleType);
      this.allManufacturers = this.transformModelsToVehicles(this.allVehicleTypes);
    }
    return (
      this.allManufacturers
        .find((v) => v.name.toLowerCase() === vehicleType.make.toLowerCase())
        ?.models.slice()
        .sort((a, b) => a.localeCompare(b)) ?? []
    );
  }

loadResources(): Observable<void> {
  this.logger.info('Start loading resource files');

  // Return immediately if resources are already loaded
  if (this.areResourcesLoaded()) {
    this.logger.info('Resources already loaded, returning cached data');
    return of(undefined);
  }

  // Return the memoized promise to prevent parallel loading
  if (this.resourceLoadingPromise) {
    this.logger.info('Resource loading already in progress, waiting for completion');
    return from(this.resourceLoadingPromise);
  }

  // Create the actual loading operation
  const translationsUrl = 'assets/resources/trans.json';
  const enumsUrl =   'assets/resources/enums.json';
  // const modelsUrl =  'assets/resources/models.json';  
  // , Observable<IVehicleType[]>
  const fileRequests: [Observable<ITranslate[]>, Observable<IEnums[]>] = [
    this.http.get<ITranslate[]>(translationsUrl).pipe(
      catchError(error => {
        this.logger.error('Error loading translation.json:', error);
        return of([] as ITranslate[]);
      })
    ),
    this.http.get<IEnums[]>(enumsUrl).pipe(
      catchError(error => {
        this.logger.error('Error loading enums.json:', error);
        return of([] as IEnums[]);
      })
    ),
    // this.http.get<IVehicleType[]>(modelsUrl).pipe(
    //   catchError(error => {
    //     this.logger.error('Error loading models.json:', error);
    //     return of([] as IVehicleType[]);
    //   })
    // )
  ];
  // , IVehicleType[]
  // Create the observable that will be memoized
  const loadingObservable = forkJoin<[ITranslate[], IEnums[]]>(fileRequests).pipe(
    tap(([wmsTranslate, wmsEnums]) => {
    // tap(([wmsTranslate, wmsEnums, wmsModels]) => {
      this.translations = wmsTranslate;
      this.enums = wmsEnums;      
      // this.allVehicleTypes = wmsModels;      
      // this.allManufacturers = this.transformModelsToVehicles(wmsModels);
      this.logger.info('All resource files loaded successfully');
    }),
    map(() => undefined)
  );

  // Memoize the promise and clear it when complete
  this.resourceLoadingPromise = new Promise<void>((resolve, reject) => {
    loadingObservable.pipe(
      finalize(() => {
        // Set the resourcesLoaded state based on data availability
        const isLoaded = this.translations && this.translations.length > 0;
        this.resourcesLoadedSubject.next(isLoaded);
      })
    ).subscribe({
      next: () => resolve(),
      error: (err) => {
        this.resourcesLoadedSubject.next(false);
        this.logger.error('Resource loading error:', err);
        resolve(); // Resolve instead of reject to handle failures gracefully
      }
    });
  });

  // Ensure promise is cleared after completion
  this.resourceLoadingPromise.finally(() => {
    this.resourceLoadingPromise = null;
  });

  return from(this.resourceLoadingPromise);
}
   areResourcesLoaded(): boolean {
    return this.resourcesLoadedSubject.value;
  }
  

T(key: string): string {
  const translation = this.translations.find(d => d.tkey === key);
  return translation ? translation[this.lang] : '*'+key; // Return key if translation is not found
}
 getEnums(key:string){
    return this.enums.filter(d => d.country == this.country 
                                    && d.lang == this.lang 
                                    && d.key == key).sort((a, b) => a.index - b.index);
  }
  
  getEnumByValue(key:string,value:string){
    let singleEnum = this.enums.filter(d =>  d.country == this.country 
                                && d.lang == this.lang 
                                && d.key == key
                                && d.value == value)[0];
    
    if(!singleEnum) 
      {
        this.logger.error(`Missing enum for country="${this.country}" lang="${this.lang}", key="${key}" and value="${value}"`);
        //this.loadEnums();
        singleEnum = this.enums.filter(d =>  d.country == this.country 
                                && d.lang == this.lang 
                                && d.key == key
                                && d.value == value)[0];
        
      }                               
    
    return singleEnum;      
  }
 
  getDefaultEnum(key:string){
    return this.enums.filter(d =>  d.country == this.country 
                                && d.lang == this.lang 
                                && d.key == key
                                && d.isdefault == true)[0];
      
  }

  getDateString(e:any)
  {
    const year:string  = e.getFullYear().toString();
    const month:string = (e.getMonth() + 1).toString().padStart(2, "0");
    const day:string   = e.getDate().toString().padStart(2, "0");
    return year +'-' + month + '-' + day
  }
  
 
  }

