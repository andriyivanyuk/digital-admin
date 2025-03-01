import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
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
  form!: FormGroup;

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

  selectedImageId: number = 0;

  ngOnInit(): void {
    this.createForm();

    const orderId = this.route.snapshot.paramMap.get('orderId')!;
    if (orderId) {
      this.getOrderById(+orderId);
    }
  }

  public createForm() {
    this.form = this.fb.group({
      firstName: [''],
      email: [''],
      phone: [''],
      totalCost: [''],
      orderedItems: this.fb.array([]),
      status_id: [null, [Validators.required]],
      category_id: [null, [Validators.required]],
    });
  }

  public prefillForm(order: Order) {
    this.form.controls['firstName'].reset(order.customer_name);
    this.form.controls['email'].reset(order.email);
    this.form.controls['phone'].reset(order.phone);
    this.form.controls['totalCost'].reset(order.total_cost);
    // this.form.controls['status_id'].reset(product.status_id);
    // this.form.controls['category_id'].reset(product.category_id);

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
        console.log(order);
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
    if (this.form.valid) {
    }
  }
}
