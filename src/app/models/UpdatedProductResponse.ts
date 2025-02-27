import { Product } from './product';

export interface UpdateProductResponse {
  message: string;
  product: Product;
}

export interface ProductImage {
  image_path: string;
  is_primary: boolean;
  image_id: number;
}
