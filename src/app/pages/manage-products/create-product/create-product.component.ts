import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';

import { AttributeDialogComponent } from 'src/app/components/attribute-dialog/attribute-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { TablerIconsModule } from 'angular-tabler-icons';
import { ProductStatus } from 'src/app/models/productStatus';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProductStatusService } from 'src/app/services/status.service';
import { CategoryService } from 'src/app/services/category.service';
import { ProductService } from 'src/app/services/products.service';
import { CommonModule } from '@angular/common';
import { Category } from 'src/app/models/category';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ImageItem } from 'src/app/models/imageItem';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss'],
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    TablerIconsModule,
    CommonModule,
    MatDialogModule,
    MatRadioModule,
  ],
  providers: [ProductStatusService, CategoryService, ProductService],
})
export class CreateProductComponent implements OnInit {
  form!: FormGroup;
  imageItems: ImageItem[] = Array(5).fill({ file: null, isPrimary: false });

  statuses$!: Observable<ProductStatus[]>;
  categories$!: Observable<Category[]>;

  readonly dialog = inject(MatDialog);
  readonly snackBar = inject(MatSnackBar);
  readonly fb = inject(FormBuilder);
  readonly loader = inject(NgxUiLoaderService);

  readonly productStatusService = inject(ProductStatusService);
  readonly categoryService = inject(CategoryService);
  readonly productService = inject(ProductService);

  selectedImageName: BehaviorSubject<string> = new BehaviorSubject<string>(
    'не вибрано'
  );

  get attributes(): FormArray {
    return this.form.get('attributes') as FormArray;
  }

  get images(): FormArray {
    return this.form.get('images') as FormArray;
  }

  public setPrimaryImage(index: number): void {
    this.form.patchValue({ primaryImageIndex: index });
    this.updateSelectedImageName(index);
  }

  public createForm() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      price: [null],
      stock: [''],
      category_id: [0, [Validators.required]],
      status_id: [0, [Validators.required]],
      attributes: this.fb.array([]),
      primaryImageIndex: ['0', Validators.required],
      images: this.fb.array([]),
    });
  }

  public addAttribute(): void {
    const dialogRef = this.dialog.open(AttributeDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const fieldGroup = this.fb.group({
          key: result.key,
          value: result.value,
        });
        this.attributes.push(fieldGroup);
      }
    });
  }

  public deleteAttribute(lessonIndex: number) {
    this.attributes.removeAt(lessonIndex);
  }

  public prefillForm() {
    this.productStatusService.statuses$.subscribe({
      next: (result) => {
        const status = result.find((status) => status.status_id);
        if (status) {
          this.form.controls['status_id'].reset(status.status_id);
        }
      },
    });
  }

  public onFileSelect(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let files = element.files;
    if (files) {
      Array.from(files).forEach((file) => {
        let reader = new FileReader();
        reader.onload = (e: any) => {
          this.images.push(
            this.fb.group({
              file: [file],
              path: [e.target.result],
            })
          );
          this.updateSelectedImageName(this.images.length - 1);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  public deleteImage(index: number) {
    this.images.removeAt(index);
    if (this.images.length === 0) {
      this.selectedImageName.next('Будь ласка, оберіть головне фото');
      this.form.patchValue({ primaryImageIndex: index });
    } else if (this.form.value.primaryImageIndex >= this.images.length) {
      this.updateSelectedImageName(this.images.length - 1);
    }
  }

  private updateSelectedImageName(index: number) {
    const image = this.images.at(index);
    const imageName = image
      ? `Фото ${parseInt(index.toString(), 10) + 1}`
      : 'Будь ласка, оберіть головне фото';
    this.selectedImageName.next(imageName);
    this.form.patchValue({ primaryImageIndex: index });
  }

  public createProduct() {
    if (this.form.valid) {
      this.loader.start();
      const formData = new FormData();

      formData.append('title', this.form.get('title')?.value);
      formData.append('description', this.form.get('description')?.value);
      formData.append('price', this.form.get('price')?.value);
      formData.append('stock', this.form.get('stock')?.value);
      formData.append('category_id', this.form.get('category_id')?.value);
      formData.append('status_id', this.form.get('status_id')?.value);

      const images = this.images.controls;
      images.forEach((imageControl, index) => {
        const file = imageControl.get('file')!.value;
        formData.append('images', file, file.name);

        if (
          index.toString() ===
          this.form.get('primaryImageIndex')!.value.toString()
        ) {
          formData.append('primary', index.toString());
        }
      });

      this.form.value.attributes.forEach((attr: any, index: number) => {
        formData.append(`attributes[${index}][key]`, attr.key);
        formData.append(`attributes[${index}][value]`, attr.value);
      });

      console.log(this.form.value);

      this.productService.addProduct(formData).subscribe({
        next: () => {
          this.form.reset();
          this.loader.stop();
          this.snackBar.open('Продукт створено', 'Закрити', {
            duration: 3000,
          });
        },
        error: (error) => {
          this.loader.stop();
          console.error('Помилка при додаванні продукту:', error);
        },
      });
    }
  }

  ngOnInit(): void {
    this.statuses$ = this.productStatusService.statuses$;
    this.categories$ = this.categoryService.getCategories();
    this.createForm();
    this.prefillForm();
  }
}
