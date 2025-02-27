import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  Observable,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { ProductStatus } from '../models/productStatus';

@Injectable()
export class ProductStatusService {
  private destroy$ = new Subject<void>();

  private apiUrl = 'http://localhost:5500/api/admin';
  private statuses = new BehaviorSubject<ProductStatus[]>([]);
  public statuses$ = this.statuses.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialStatuses();
  }

  private loadInitialStatuses() {
    this.http
      .get<ProductStatus[]>(this.apiUrl + '/product/statuses')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (statuses) => this.statuses.next(statuses),
        error: (error) => {
          console.error('error in getting statuses: ', error);
        },
      });
  }
}
