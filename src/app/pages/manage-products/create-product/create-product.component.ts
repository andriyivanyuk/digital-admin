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
import { first, Observable } from 'rxjs';
import { ProductStatusService } from 'src/app/services/status.service';
import { CategoryService } from 'src/app/services/category.service';
import { ProductService } from 'src/app/services/products.service';
import { TransformStatusesPipe } from 'src/app/pipe/transformStatuses.pipe';
import { CommonModule } from '@angular/common';
import { Category } from 'src/app/models/category';

interface ImageItem {
  file: File | null;
  isPrimary: boolean;
}

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
    TransformStatusesPipe,
    CommonModule,
    MatDialogModule,
    MatRadioModule,
  ],
  providers: [ProductStatusService, CategoryService, ProductService],
})
export class CreateProductComponent implements OnInit {
  form!: FormGroup;
  imageItems: ImageItem[] = Array(5).fill({ file: null, isPrimary: false });

  selectedFile: File | null = null;

  statuses$!: Observable<ProductStatus[]>;
  categories$!: Observable<Category[]>;

  readonly dialog = inject(MatDialog);

  constructor(
    private fb: FormBuilder,
    private productStatusService: ProductStatusService,
    private categoryService: CategoryService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.statuses$ = this.productStatusService.getStatuses();
    this.categories$ = this.categoryService.getCategories();
    this.createForm();
    this.prefillForm();
  }

  public onFileSelected(event: Event, index: number): void {
    const element = event.target as HTMLInputElement;
    let files: FileList | null = element.files;

    if (files && files.length > 0) {
      const file = files[0];
      this.imageItems[index] = { ...this.imageItems[index], file: file };
      if (this.imageItems.every((item) => !item.isPrimary)) {
        this.setPrimaryImage(index);
      }
    }
  }

  public setPrimaryImage(index: number): void {
    this.imageItems.forEach((item, i) => (item.isPrimary = i === index));
    this.form.patchValue({ primaryImageIndex: index });
  }

  get attributes(): FormArray {
    return this.form.get('attributes') as FormArray;
  }

  public createForm() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      primaryImageIndex: ['', Validators.required],
      price: [''],
      stock: [''],
      status_id: [0],
      category_id: [0],
      description: [''],
      attributes: this.fb.array([]),
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
    this.statuses$.pipe(first()).subscribe({
      next: (result) => {
        const status = result.find((status) => status.status_id);
        if (status) {
          this.form.controls['status_id'].reset(status.status_id);
        }
      },
    });
  }

  public createProduct() {
    if (this.form.valid) {
      const formData = new FormData();

      formData.append('title', this.form.get('title')?.value);
      formData.append('description', this.form.get('description')?.value);
      formData.append('price', this.form.get('price')?.value);
      formData.append('stock', this.form.get('stock')?.value);
      formData.append('category_id', this.form.get('category_id')?.value);
      formData.append('status_id', this.form.get('status_id')?.value);

      this.imageItems.forEach((img, index) => {
        if (img.file) {
          formData.append('images', img.file, img.file.name);
          if (img.isPrimary) {
            formData.append('primary', index.toString());
          }
        }
      });

      this.form.value.attributes.forEach((attr: any, index: number) => {
        formData.append(`attributes[${index}][key]`, attr.key);
        formData.append(`attributes[${index}][value]`, attr.value);
      });

      this.productService.addProduct(formData).subscribe({
        next: () => {
          this.form.reset();
        },
        error: (error) => {
          console.error('Помилка при додаванні продукту:', error);
        },
      });
    }
  }
}
