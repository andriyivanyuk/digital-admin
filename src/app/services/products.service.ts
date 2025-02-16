import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product';

@Injectable()
export class ProductService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  public getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl + '/products');
  }

  public getProductById(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${productId}`);
  }

  public addProduct(product: FormData): Observable<Product> {
    return this.http.post<Product>(this.apiUrl + '/product/add', product);
  }

  public updateProduct(
    productId: number,
    product: FormData
  ): Observable<Product> {
    return this.http.put<Product>(
      `${this.apiUrl}/product/${productId}`,
      product
    );
  }

  public deleteProduct(productId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/product/${productId}`
    );
  }
}
