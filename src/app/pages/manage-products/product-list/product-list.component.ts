import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { CategoryService } from 'src/app/services/category.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { ProductService } from 'src/app/services/products.service';
import { Observable, Subscription } from 'rxjs';
import { MappedProduct } from 'src/app/models/mappedproduct';

export interface productsData {
  id: number;
  imagePath: string;
  uname: string;
  budget: number;
  priority: string;
}

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  imports: [CommonModule, MaterialModule],
  providers: [ProductService],
})
export class ProductListComponent implements OnInit, OnDestroy {
  displayedColumns1: string[] = [
    'assigned',
    'name',
    'priority',
    'price',
    'budget',
  ];
  // dataSource1 = PRODUCT_DATA;
  dataSource1 = new MatTableDataSource<MappedProduct>();
  private subscriptions: Subscription = new Subscription();

  readonly productService = inject(ProductService);
  constructor() {}

  products$: Observable<any[]>;

  ngOnInit(): void {
    const subscription = this.productService.getProducts().subscribe((data) => {
      this.dataSource1.data = data;
    });
    this.subscriptions.add(subscription);
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
