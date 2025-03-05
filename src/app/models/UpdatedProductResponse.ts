export interface UpdateProductResponse {
  message: string;
  product: any;
}

export interface ProductImage {
  image_path: string;
  is_primary: boolean;
  image_id: number;
}
