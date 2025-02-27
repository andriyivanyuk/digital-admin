import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { Category } from '../models/category';

@Injectable()
export class CategoryService {
  private apiUrl = 'http://localhost:5500/api/admin';

  private categories = new BehaviorSubject<any[]>([]);
  public categories$ = this.categories.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  public createCategory(category: any): Observable<any> {
    return this.http.post(this.apiUrl + '/category/add-category', category);
  }

  public getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl + '/categories').pipe(
      tap((statuses) => {
        return this.categories.next(statuses);
      }),
      catchError((error) => {
        throw 'error in getting categories: ' + error;
      })
    );
  }
}
