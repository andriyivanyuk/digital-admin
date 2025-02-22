import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Product, UpdateProductResponse } from '../models/product';
import { mappedProduct } from '../models/mappedProduct';
import { Image } from '../models/image';

@Injectable()
export class UploadService {
  private apiUrl = 'http://localhost:5000/api/images';

  constructor(private http: HttpClient) {}

  public uploadImage(image: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/upload', image);
  }

  public uploadMultipleImages(
    productId: number,
    images: File[],
    primaryImageIndex: number
  ): Observable<any> {
    const formData: FormData = new FormData();

    images.forEach((image, index) => {
      formData.append('images', image, image.name);
    });
    formData.append('primaryImageIndex', primaryImageIndex.toString());
    formData.append('productId', productId.toString());

    return this.http.post(this.apiUrl + '/uploadMultiple', formData, {
      reportProgress: true,
      observe: 'events',
      responseType: 'json',
    });
    // return this.http.post<any>(this.apiUrl + '/uploadMultiple', image);
  }
}
