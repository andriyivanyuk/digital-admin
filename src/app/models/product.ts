export interface UpdateProductResponse {
  message: string;
  product: Product;
}

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
  category_title: string;
  attributes: any;
  images: ProductImage[];
}

export interface ProductImage {
  image_path: string;
  is_primary: boolean;
  image_id: number;
}
