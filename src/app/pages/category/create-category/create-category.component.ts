import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { CategoryService } from 'src/app/pages/category/services/category.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-create-category',
  templateUrl: './create-category.component.html',
  styleUrls: ['./create-category.component.scss'],
  imports: [
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
  ],
  providers: [CategoryService],
})
export class CreateCategoryComponent implements OnInit {
  form!: FormGroup;

  readonly snackBar = inject(MatSnackBar);
  readonly loader = inject(NgxUiLoaderService);
  readonly formBuilder = inject(FormBuilder);

  readonly categoryService = inject(CategoryService);

  private createForm() {
    this.form = this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
    });
  }
  public createCategory() {
    if (this.form.invalid) {
      return;
    }
    this.loader.start();
    const request: any = {
      title: this.form.value.title,
      description: this.form.value.description,
    };
    this.categoryService.createCategory(request).subscribe({
      next: () => {
        this.loader.stop();
        this.snackBar.open('Категорію додано', 'Закрити', {
          duration: 3000,
        });
        this.form.reset();
      },
      error: (error) => {
        this.loader.stop();
        console.log(error);
      },
    });
  }

  public clear() {
    this.form.reset();
  }
  ngOnInit(): void {
    this.createForm();
  }
}
