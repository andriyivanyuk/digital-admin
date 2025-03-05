import { ProductAttribute } from '../pages/manage-products/models/productAttribute';
import { ProductImage } from './UpdatedProductResponse';

export interface Product {
  product_id: number;
  title: string;
  description: string;
  price: string;
  stock: number;
  category_id: number;
  created_by_user_id: number;
  status_id: number;
  created_at: string;
  updated_at: string;
  status_name: string;
  attributes: ProductAttribute[];
  images: ProductImage[];
}
