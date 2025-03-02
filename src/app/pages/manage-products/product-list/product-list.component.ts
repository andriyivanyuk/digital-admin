import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { ProductService } from 'src/app/services/products.service';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  Subscription,
  switchMap,
} from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DeleteDialogComponent } from 'src/app/components/dialogs/delete/delete-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { PageEvent } from '@angular/material/paginator';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ViewProduct } from 'src/app/models/ViewProduct';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule,
    MatDialogModule,
  ],
  providers: [ProductService],
})
export class ProductListComponent implements OnInit, OnDestroy {
  form!: FormGroup;

  displayedColumns: string[] = [
    'title',
    'amount',
    'status',
    'price',
    'actions',
  ];

  //For pagination
  totalProducts = 0;
  page = 1;
  limit = 20;

  isLoaded: boolean = false;

  dataSource = new MatTableDataSource<ViewProduct>();
  private subscriptions: Subscription = new Subscription();

  readonly productService = inject(ProductService);
  readonly router = inject(Router);
  readonly dialog = inject(MatDialog);
  readonly snackBar = inject(MatSnackBar);
  readonly loader = inject(NgxUiLoaderService);
  readonly fb = inject(FormBuilder);

  public createForm() {
    this.form = this.fb.group({
      title: ['', [Validators.required]],
    });
  }

  public editProduct(id: number) {
    this.router.navigate(['/manage-products/edit-product', id]);
  }

  public openDialog(id: number): void {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '450px',
    });

    const dialogSubscription = dialogRef
      .afterClosed()
      .pipe(
        switchMap((result) => {
          if (result) {
            this.loader.start();
            return this.productService.deleteProduct(id);
          }
          return of(null);
        })
      )
      .subscribe({
        next: (result) => {
          if (result) {
            this.loader.stop();
            this.getProducts();
            this.snackBar.open(result.message, 'Закрити', {
              duration: 3000,
            });
          }
        },
        error: (error) => {
          this.loader.stop();
          console.error(error);
        },
      });

    this.subscriptions.add(dialogSubscription);
  }

  public getProducts(value: string = ''): void {
    const subscription = this.productService
      .getProducts(this.page, this.limit, value)
      .pipe(
        catchError((error) => {
          this.loader.stop();
          throw 'error in getting products: ' + error;
        })
      )
      .subscribe((result) => {
        this.loader.stop();

        const products = this.productService.mapProducts(result.products);
        this.dataSource.data = products;
        this.totalProducts = products.length;
        if (result.products.length) {
          this.isLoaded = true;
        } else {
          this.isLoaded = false;
        }
      });
    this.subscriptions.add(subscription);
  }

  public onPageEvent(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;
    this.getProducts();
  }

  ngOnInit(): void {
    this.createForm();
    this.loader.start();
    this.getProducts();

    this.form.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.page = 1;
        if (value) {
          this.getProducts(value.title);
        }
      });
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
