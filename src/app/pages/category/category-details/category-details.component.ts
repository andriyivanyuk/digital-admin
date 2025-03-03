import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CategoryService } from 'src/app/pages/category/services/category.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material.module';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UpdateCategory } from '../models/updateCategory';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-category-details',
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.scss'],
  imports: [RouterModule, FormsModule, ReactiveFormsModule, MaterialModule],
  providers: [CategoryService],
})
export class CategoryDetailsComponent implements OnInit {
  form!: FormGroup;

  readonly snackBar = inject(MatSnackBar);
  readonly loader = inject(NgxUiLoaderService);
  readonly formBuilder = inject(FormBuilder);

  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);

  readonly categoryService = inject(CategoryService);

  ngOnInit(): void {
    this.createForm();
    const id = this.route.snapshot.paramMap.get('id')!;
    if (id) {
      this.prefillForm(+id);
    }
  }

  private createForm() {
    this.form = this.formBuilder.group({
      category_id: [null],
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
    });
  }

  public backToCategories() {
    this.router.navigate(['/categories/category-list']);
  }

  public prefillForm(id: number) {
    if (id) {
      this.categoryService.getCategoryById(id).subscribe({
        next: (result) => {
          this.form.reset(result);
        },
        error: (error) => {
          console.error(error);
        },
      });
    }
  }

  public updateCategory() {
    if (this.form.invalid) {
      return;
    }

    this.loader.start();

    const request: UpdateCategory = {
      id: this.form.value.category_id,
      category: {
        title: this.form.value.title,
        description: this.form.value.description,
      },
    };
    this.categoryService.updateCategory(request).subscribe({
      next: (result) => {
        console.log(result);
        this.loader.stop();
        this.snackBar.open('Категорію оновлено', 'Закрити', {
          duration: 3000,
        });
        this.form.reset(result);
      },
      error: (error) => {
        this.loader.stop();
        console.error(error);
      },
    });
  }
}
