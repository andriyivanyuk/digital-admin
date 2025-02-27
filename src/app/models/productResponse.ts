import { Product } from './product';

export interface ProductResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductAttribute {
  key: string;
  value: string;
}

export interface ProductImage {
  image_path: string;
  is_primary: boolean;
  image_id?: number;
}
