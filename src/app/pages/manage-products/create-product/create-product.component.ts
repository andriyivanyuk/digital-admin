import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatDialog } from '@angular/material/dialog';

import { AttributeDialogComponent } from 'src/app/components/dialogs/attribute-dialog/attribute-dialog.component';
import { TablerIconsModule } from 'angular-tabler-icons';
import { ProductStatus } from 'src/app/models/productStatus';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { ProductStatusService } from 'src/app/services/status.service';
import { CategoryService } from 'src/app/pages/category/services/category.service';
import { ProductService } from 'src/app/services/products.service';
import { CommonModule } from '@angular/common';
import { Category } from 'src/app/pages/category/models/category';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MaterialModule } from 'src/app/material.module';
import { minImageCountValidator } from 'src/app/validators/min-image-count.validator';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule,
    CommonModule,
    MaterialModule,
  ],
  providers: [ProductStatusService, CategoryService, ProductService],
})
export class CreateProductComponent implements OnInit {
  private destroy$ = new Subject<void>();

  form!: FormGroup;
  imageActive: boolean = true;

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

  ngOnInit(): void {
    this.statuses$ = this.productStatusService.statuses$;
    this.categories$ = this.categoryService.getCategories();
    this.createForm();
    this.prefillForm();
  }

  get images(): FormArray {
    return this.form.get('images') as FormArray;
  }

  public setPrimaryImage(index: number): void {
    this.form.patchValue({ primary: index });
    this.updateSelectedImageName(index);
  }

  public createForm() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      price: [null, [Validators.required]],
      stock: [null, [Validators.required]],
      category_id: [null, [Validators.required]],
      status_id: [null, [Validators.required]],
      attributes: this.fb.array([]),
      primary: [null],
      images: this.fb.array([], minImageCountValidator(1)),
    });
  }

  get attributes(): FormArray {
    return this.form.get('attributes') as FormArray;
  }

  attributeForms: FormGroup[][] = [];

  public addAttributeControl(key: string, attributes: string[]) {
    const attributeForm = this.fb.group({
      title: [key, Validators.required],
      attributeValues: this.fb.array([]),
    });

    const attributeValuesArray = attributeForm.get(
      'attributeValues'
    ) as FormArray;
    this.attributeForms.push([]);

    attributes.forEach((attr) => {
      const valueForm = this.fb.group({
        attributeValueTitle: [attr, Validators.required],
      });
      attributeValuesArray.push(valueForm);
      this.attributeForms[this.attributeForms.length - 1].push(valueForm);
    });

    this.attributes.push(attributeForm);
  }

  get attributeFormGroups(): FormGroup[] {
    return this.attributes.controls as FormGroup[];
  }

  public deleteAttributeControl(index: number) {
    this.attributeForms.splice(index, 1);
    this.attributes.removeAt(index);
  }

  public deleteAttributeValue(
    attributeIndex: number,
    valueIndex: number
  ): void {
    const attributeValues = this.attributes
      .at(attributeIndex)
      .get('attributeValues') as FormArray;
    if (attributeValues && attributeValues.length > valueIndex) {
      attributeValues.removeAt(valueIndex);
      this.attributeForms[attributeIndex].splice(valueIndex, 1);
    }
  }

  public getAttributeValues(attributeForm: FormGroup): FormGroup[] {
    return (attributeForm.get('attributeValues') as FormArray)
      .controls as FormGroup[];
  }

  public addAttribute(): void {
    const dialogRef = this.dialog.open(AttributeDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const attributes = result.attributeValues.filter(
          (item: string) => !!item
        );

        this.addAttributeControl(result.key, attributes);
      }
    });
  }

  public addAttributeValue(attributeIndex: number): void {
    const attributeForm = this.attributes.at(attributeIndex) as FormGroup;
    const attributeValuesArray = attributeForm.get(
      'attributeValues'
    ) as FormArray;

    const newValueForm = this.fb.group({
      attributeValueTitle: ['', Validators.required],
    });

    attributeValuesArray.push(newValueForm);
    this.attributeForms[attributeIndex].push(newValueForm);
  }

  public deleteAttribute(lessonIndex: number) {
    this.attributes.removeAt(lessonIndex);
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
      this.form.patchValue({ primary: index });
    } else if (this.form.value.primary >= this.images.length) {
      this.updateSelectedImageName(this.images.length - 1);
    }
  }

  private updateSelectedImageName(index: number) {
    const image = this.images.at(index);
    const imageName = image
      ? `Фото ${parseInt(index.toString(), 10) + 1}`
      : 'Будь ласка, оберіть головне фото';
    this.selectedImageName.next(imageName);
    this.form.patchValue({ primary: index });
  }

  public clear() {
    this.form.reset();
  }

  public mapValuesAttributes(array: any[]) {
    return array.map((item) => ({
      key: item.title,
      values: item.attributeValues.map(
        (value: any) => value.attributeValueTitle
      ),
    }));
  }

  public prefillForm() {
    this.statuses$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        const status = result.find((status) => status.status_id);
        if (status) {
          this.form.controls['status_id'].reset(status.status_id);
        }
      },
    });
    this.categories$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        const category = result.find((category) => category.category_id);
        if (category) {
          this.form.controls['category_id'].reset(category.category_id);
        }
      },
    });
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
        if (file) {
          formData.append('images', file, file.name);
        }

        if (index.toString() === this.form.get('primary')!.value.toString()) {
          formData.append('primary', index.toString());
        }
      });

      const attributes = this.mapValuesAttributes(this.attributes.value);
      formData.append('attributes', JSON.stringify(attributes));

      this.productService.addProduct(formData).subscribe({
        next: () => {
          this.imageActive = false;
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
}
