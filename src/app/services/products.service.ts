import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Product, UpdateProductResponse } from '../models/product';
import { mappedProduct } from '../models/mappedProduct';
import { Image } from '../models/image';

@Injectable()
export class ProductService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  public getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + '/products').pipe(
      map((products) =>
        products.map((product) => ({
          ...product,
          images: product.images?.map((image: Image) => ({
            ...image,
            fullPath: `http://localhost:5000/${image.image_path}`,
          })),
        }))
      )
    );
  }

  public mapProducts(products: any[]): mappedProduct[] {
    return products.map((product) => {
      const primaryImage = product?.images?.find(
        (image: Image) => image.is_primary === true
      );
      return {
        product_id: product.product_id,
        title: product.title,
        price: product.price,
        stock: product.stock,
        status_name: product.status_name,
        fullPath: primaryImage ? primaryImage.fullPath : null,
      };
    });
  }

  public getProductById(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/product/${productId}`);
  }

  public addProduct(product: FormData): Observable<Product> {
    return this.http.post<Product>(this.apiUrl + '/product/add', product);
  }

  public updateProduct(
    productId: number,
    product: FormData
  ): Observable<UpdateProductResponse> {
    return this.http.put<UpdateProductResponse>(
      `${this.apiUrl}/product/${productId}`,
      product
    );
  }

  public deleteProduct(productId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/product/${productId}`
    );
  }

  public deleteImages(imageIds: number[] | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/productImages`, {
      body: { imageIds },
    });
  }
}
