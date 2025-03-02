import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { TablerIconsModule } from 'angular-tabler-icons';

import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material.module';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { OrderService } from '../services/order.service';
import { Order, OrderItem } from '../model/order';
import { Observable } from 'rxjs';
import { UpdateOrderStatus } from '../model/updateOrderRequest';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss'],
  imports: [
    ReactiveFormsModule,
    TablerIconsModule,
    CommonModule,
    MaterialModule,
    MatDialogModule,
  ],
  providers: [OrderService],
})
export class OrderDetailsComponent implements OnInit {
  statusControl = new FormControl(null, [Validators.required]);
  form!: FormGroup;
  orderId: number;

  orderStatuses$!: Observable<any[]>;

  readonly dialog = inject(MatDialog);
  readonly snackBar = inject(MatSnackBar);
  readonly fb = inject(FormBuilder);
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);

  readonly orderService = inject(OrderService);

  readonly loader = inject(NgxUiLoaderService);

  get orderedItems(): FormArray {
    return this.form.get('orderedItems') as FormArray;
  }

  ngOnInit(): void {
    this.createForm();

    const orderId = this.route.snapshot.paramMap.get('orderId')!;
    if (orderId) {
      this.getOrderById(+orderId);
    }
    this.orderStatuses$ = this.orderService.orderStatuses$;
  }

  public createForm() {
    this.form = this.fb.group({
      firstName: [''],
      email: [''],
      phone: [''],
      totalCost: [''],
      orderedItems: this.fb.array([]),
    });
  }

  public prefillForm(order: Order) {
    this.form.controls['firstName'].reset(order.customer_name);
    this.form.controls['email'].reset(order.email);
    this.form.controls['phone'].reset(order.phone);
    this.form.controls['totalCost'].reset(order.total_cost);

    if (!!order.items.length) {
      this.setItems(order?.items);
    }
  }

  public setItems(order: OrderItem[]): void {
    const imagesFormArray = this.orderedItems as FormArray;
    if (order?.length) {
      order.forEach((order) => {
        const fullPath = `http://localhost:5500/${order.image_path}`;
        imagesFormArray.push(
          this.fb.group({
            path: [fullPath],
            title: [order.title],
            price: [order.price],
          })
        );
      });
    }
  }

  public backToOrders() {
    this.router.navigate(['/orders/order-list']);
  }

  public getOrderById(id: number) {
    this.loader.start();
    this.orderService.getOrderDetails(id).subscribe({
      next: (order) => {
        this.orderId = order.order_id;
        this.prefillForm(order);
        this.loader.stop();
        this.form.disable();
      },
      error: (error) => {
        this.loader.stop();
        console.error(error);
      },
    });
  }

  public updateProduct(): void {
    if (this.orderId && this.statusControl.value) {
      const request: UpdateOrderStatus = {
        orderId: this.orderId,
        statusId: this.statusControl.value,
      };
      console.log(this.statusControl.value, request);
      this.orderService.updateOrderStatus(request).subscribe({
        next: (result) => {
          console.log(result);
        },
        error: (error) => {
          console.log(error);
        },
      });
      console.log(request);
    }
  }
}
