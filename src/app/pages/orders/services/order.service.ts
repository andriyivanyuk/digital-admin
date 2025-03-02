import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { Order } from '../model/order';
import { ViewOrder } from '../model/viewOrder';
import { UpdateOrderStatus } from '../model/updateOrderRequest';

@Injectable()
export class OrderService {
  private apiUrl = 'http://localhost:5500/api/admin';

  // For order status
  private destroy$ = new Subject<void>();
  private orderStatuses = new BehaviorSubject<any[]>([]);
  public orderStatuses$ = this.orderStatuses.asObservable();

  constructor(private http: HttpClient) {
    this.loadOrderStatuses();
  }

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

  private loadOrderStatuses() {
    this.http
      .get<any[]>(this.apiUrl + '/orderStatuses')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (statuses) => this.orderStatuses.next(statuses),
        error: (error) => {
          console.error('error in getting statuses: ', error);
        },
      });
  }

  public updateOrderStatus(request: UpdateOrderStatus): Observable<any> {
    const url = `${this.apiUrl}/order/${request.orderId}/status`;
    return this.http.put(url, request);
  }
}
