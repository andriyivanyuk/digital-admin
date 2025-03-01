import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../model/order';
import { ViewOrder } from '../model/viewOrder';

@Injectable()
export class OrderService {
  private apiUrl = 'http://localhost:5500/api/admin';

  constructor(private http: HttpClient) {}

  public getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders`);
  }

  public getOrderDetails(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/order/${orderId}`);
  }

  public mapOrders(orders: Order[]): ViewOrder[] {
    return orders.map((order) => {
      return {
        id: order.order_id,
        customerName: order.customer_name,
        email: order.email,
        phone: order.phone,
        status: order.status,
        totalCost: parseInt(order.total_cost, 10),
      };
    });
  }
}
