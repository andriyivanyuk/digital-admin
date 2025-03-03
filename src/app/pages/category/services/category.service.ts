import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';
import { Category } from '../models/category';
import { UpdateCategory } from '../models/updateCategory';

@Injectable()
export class CategoryService {
  private apiUrl = 'http://localhost:5500/api/admin';

  private categories = new BehaviorSubject<Category[]>([]);
  public categories$ = this.categories.asObservable();

  constructor(private http: HttpClient) {}

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

  public getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/category/${id}`).pipe(
      catchError((error: any) => {
        console.error('Error retrieving category:', error);
        throw error;
      })
    );
  }

  public updateCategory(request: UpdateCategory): Observable<Category> {
    return this.http
      .put<Category>(`${this.apiUrl}/category/${request.id}`, request.category)
      .pipe(
        catchError((error: any) => {
          console.error('Error updating category:', error);
          throw error;
        })
      );
  }

  public deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/category/${id}`).pipe(
      catchError((error: any) => {
        console.error('Error deleting category:', error);
        throw error;
      })
    );
  }
}
