import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { catchError, Subscription } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CategoryService } from '../services/category.service';
import { Category } from 'src/app/pages/category/models/category';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
  imports: [CommonModule, MaterialModule, RouterModule],
  providers: [CategoryService],
})
export class CategoryListComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['id', 'title', 'description', 'actions'];

  isLoaded: boolean = false;

  dataSource = new MatTableDataSource<Category>();

  private subscriptions: Subscription = new Subscription();

  readonly router = inject(Router);
  readonly dialog = inject(MatDialog);
  readonly snackBar = inject(MatSnackBar);
  readonly loader = inject(NgxUiLoaderService);
  readonly categoryService = inject(CategoryService);

  public getCategories(): void {
    this.loader.start();
    const subscription = this.categoryService
      .getCategories()
      .pipe(
        catchError((error) => {
          this.loader.stop();
          throw 'error in getting products: ' + error;
        })
      )
      .subscribe((result) => {
        this.loader.stop();
        this.dataSource.data = result;
        if (result.length) {
          this.isLoaded = true;
        } else {
          this.isLoaded = false;
        }
      });
    this.subscriptions.add(subscription);
  }

  public editCategory(id: number) {
    this.router.navigate(['/categories/category-details', id]);
  }

  public deleteCategory(id: number) {
    this.categoryService.deleteCategory(id).subscribe({
      next: (result) => {
        this.loader.stop();
        this.snackBar.open('Категорію видалено', 'Закрити', {
          duration: 3000,
        });
        this.getCategories();
      },
      error: (error) => {
        this.loader.stop();
        console.error(error);
      },
    });
  }

  ngOnInit(): void {
    this.getCategories();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
