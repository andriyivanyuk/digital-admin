import { Product } from './Product';

export interface ProductResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductImage {
  image_path: string;
  is_primary: boolean;
  image_id?: number;
}
