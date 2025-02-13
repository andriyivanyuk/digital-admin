export interface Product {
  product_id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
  status_id: number;
  image_path: string;
  created_by_user_id: number;
}
