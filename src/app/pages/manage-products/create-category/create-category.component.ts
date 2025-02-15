import { Component, OnInit } from '@angular/core';
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
import { CategoryService } from 'src/app/services/category.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-category',
  imports: [
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
  ],
  templateUrl: './create-category.component.html',
  providers: [CategoryService],
})
export class CreateCategoryComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar
  ) {}

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
    const request: any = {
      title: this.form.value.title,
      description: this.form.value.description,
    };
    this.categoryService.createCategory(request).subscribe({
      next: () => {
        this.snackBar.open('Категорію додано', 'Close', {
          duration: 3000,
        });
        this.form.reset();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  public clearForm() {
    this.form.reset();
  }
  ngOnInit(): void {
    this.createForm();
  }
}
