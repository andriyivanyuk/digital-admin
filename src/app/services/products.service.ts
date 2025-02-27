import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { UpdateProductResponse } from '../models/UpdatedProductResponse';
import { ProductImage } from '../models/productImage';
import { ProductResponse } from '../models/productResponse';
import { ViewProduct } from '../models/ViewProduct';
import { Product } from '../models/product';

@Injectable()
export class ProductService {
  private apiUrl = 'http://localhost:5500/api/admin';

  constructor(private http: HttpClient) {}

  public getProducts(
    page: number,
    limit: number,
    search: string = ''
  ): Observable<ProductResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http
      .get<ProductResponse>(`${this.apiUrl}/products`, { params })
      .pipe(
        map((result) => ({
          total: result.total,
          page: result.page,
          limit: result.limit,
          products: result.products.map((product) => ({
            ...product,
            images: product.images?.map((image: ProductImage) => ({
              ...image,
              fullPath: `http://localhost:5500/${image.image_path}`,
            })),
          })),
        }))
      );
  }

  public mapProducts(products: any[]): ViewProduct[] {
    return products.map((product) => {
      const primaryImage = product?.images?.find(
        (image: ProductImage) => image.is_primary === true
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
