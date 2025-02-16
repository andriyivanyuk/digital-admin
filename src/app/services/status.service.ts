import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';
import { ProductStatus } from '../models/productStatus';

@Injectable()
export class ProductStatusService {
  private apiUrl = 'http://localhost:5000/api';

  private statuses = new BehaviorSubject<any[]>([]);
  public statuses$ = this.statuses.asObservable();

  constructor(private http: HttpClient) {}

  public getStatuses(): Observable<ProductStatus[]> {
    return this.http
      .get<ProductStatus[]>(this.apiUrl + '/product/statuses')
      .pipe(
        tap((statuses) => {
          return this.statuses.next(statuses);
        }),
        catchError((error) => {
          throw 'error in getting statuses: ' + error;
        })
      );
  }
}
