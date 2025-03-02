import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { catchError, Subscription } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { FormGroup } from '@angular/forms';
import { OrderService } from '../services/order.service';
import { ViewOrder } from '../model/viewOrder';
import { WebSocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
  imports: [CommonModule, MaterialModule, RouterModule],
  providers: [OrderService],
})
export class OrderListComponent implements OnInit, OnDestroy {
  form!: FormGroup;

  displayedColumns: string[] = [
    'customerName',
    'email',
    'phone',
    'status',
    'totalCost',
    'actions',
  ];

  isLoaded: boolean = false;

  dataSource = new MatTableDataSource<ViewOrder>();
  private subscriptions: Subscription = new Subscription();

  readonly router = inject(Router);
  readonly dialog = inject(MatDialog);
  readonly snackBar = inject(MatSnackBar);
  readonly loader = inject(NgxUiLoaderService);

  readonly orderService = inject(OrderService);
  readonly webSocketService = inject(WebSocketService);

  public getProducts(): void {
    this.loader.start();
    const subscription = this.orderService
      .getOrders()
      .pipe(
        catchError((error) => {
          this.loader.stop();
          throw 'error in getting products: ' + error;
        })
      )
      .subscribe((result) => {
        this.loader.stop();
        const orders = this.orderService.mapOrders(result);
        this.dataSource.data = orders;
        if (result.length) {
          this.isLoaded = true;
        } else {
          this.isLoaded = false;
        }
      });
    this.subscriptions.add(subscription);
  }

  public handleCurrentOrder() {
    this.webSocketService.onNewOrder().subscribe((order) => {
      this.snackBar
        .open('Нове замовлення отримано! Перевірте деталі.', 'Переглянути', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        })
        .onAction()
        .subscribe(() => {
          this.getProducts();
        });
    });
  }

  public editOrder(id: number) {
    this.router.navigate(['/orders/order-details', id]);
  }

  ngOnInit(): void {
    this.handleCurrentOrder();
    this.getProducts();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.webSocketService.disconnect();
  }
}
