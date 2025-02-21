import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { ProductService } from 'src/app/services/products.service';
import { of, Subscription, switchMap } from 'rxjs';
import { mappedProduct } from 'src/app/models/mappedProduct';
import { Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DeleteDialogComponent } from 'src/app/components/dialogs/delete/delete-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  imports: [CommonModule, MaterialModule, RouterModule, MatDialogModule],
  providers: [ProductService],
})
export class ProductListComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'title',
    'amount',
    'status',
    'price',
    'actions',
  ];

  dataSource = new MatTableDataSource<mappedProduct>();
  private subscriptions: Subscription = new Subscription();

  readonly productService = inject(ProductService);
  readonly router = inject(Router);
  readonly dialog = inject(MatDialog);
  readonly snackBar = inject(MatSnackBar);
  readonly loader = inject(NgxUiLoaderService);

  public editProduct(id: number) {
    this.router.navigate(['/manage-products/edit-product', id]);
  }

  public openDialog(id: number): void {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '250px',
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

  public getProducts(): void {
    const subscription = this.productService.getProducts().subscribe((data) => {
      if (data) {
        const products = this.productService.mapProducts(data);
        console.log(products);
        this.dataSource.data = products;
        this.loader.stop();
      }
    });
    this.subscriptions.add(subscription);
  }

  ngOnInit(): void {
    this.loader.start();
    this.getProducts();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
