import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatDialog } from '@angular/material/dialog';

import { AttributeDialogComponent } from 'src/app/components/dialogs/attribute-dialog/attribute-dialog.component';
import { TablerIconsModule } from 'angular-tabler-icons';
import { ProductStatus } from 'src/app/models/productStatus';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { ProductStatusService } from 'src/app/services/status.service';
import { CategoryService } from 'src/app/pages/category/services/category.service';
import { ProductService } from 'src/app/services/products.service';
import { CommonModule } from '@angular/common';
import { Category } from 'src/app/pages/category/models/category';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material.module';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { UpdateProductResponse } from 'src/app/models/UpdatedProductResponse';
import { minImageCountValidator } from 'src/app/validators/min-image-count.validator';
import { Product } from 'src/app/models/Product';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss'],
  imports: [
    ReactiveFormsModule,
    TablerIconsModule,
    CommonModule,
    MaterialModule,
  ],
  providers: [ProductStatusService, CategoryService, ProductService],
})
export class EditProductComponent implements OnInit {
  form!: FormGroup;
  attributeForms: FormGroup[][] = [];

  statuses$!: Observable<ProductStatus[]>;
  categories$!: Observable<Category[]>;

  readonly dialog = inject(MatDialog);
  readonly snackBar = inject(MatSnackBar);
  readonly fb = inject(FormBuilder);
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);

  readonly productStatusService = inject(ProductStatusService);
  readonly categoryService = inject(CategoryService);
  readonly productService = inject(ProductService);

  readonly loader = inject(NgxUiLoaderService);

  get attributes(): FormArray {
    return this.form.get('attributes') as FormArray;
  }

  get images(): FormArray {
    return this.form.get('images') as FormArray;
  }

  imageIds: number[] = [];
  selectedImageId: number = 0;
  selectedImageName: BehaviorSubject<string> = new BehaviorSubject<string>(
    'не вибрано'
  );

  ngOnInit(): void {
    this.statuses$ = this.productStatusService.statuses$;
    this.categories$ = this.categoryService.getCategories();
    this.createForm();

    const productId = this.route.snapshot.paramMap.get('id')!;
    this.getProductById(+productId);
  }

  public createForm() {
    this.form = this.fb.group({
      product_id: [0],
      title: ['', [Validators.required]],
      price: [null, [Validators.required]],
      stock: [null, [Validators.required]],
      status_id: [null, [Validators.required]],
      category_id: [null, [Validators.required]],
      description: [''],
      attributes: this.fb.array([]),
      primary: [null],
      images: this.fb.array([], minImageCountValidator(1)),
    });
  }

  public addAttributeControl(key: string, attributes: string[]) {
    const attributeForm = this.fb.group({
      attribute_id: [],
      key: [key, Validators.required],
      attributeValues: this.fb.array([]),
    });

    const attributeValuesArray = attributeForm.get(
      'attributeValues'
    ) as FormArray;
    this.attributeForms.push([]);

    attributes.forEach((attr) => {
      const valueForm = this.fb.group({
        value_id: [],
        value: [attr, Validators.required],
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

  public addAttributeValue(attributeIndex: number): void {
    const attributeForm = this.attributes.at(attributeIndex) as FormGroup;
    const attributeValuesArray = attributeForm.get(
      'attributeValues'
    ) as FormArray;

    const newValueForm = this.fb.group({
      value: ['', Validators.required],
      value_id: [null],
    });

    attributeValuesArray.push(newValueForm);

    this.attributeForms[attributeIndex].push(newValueForm);

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
              imageId: null,
            })
          );

          this.updateSelectedImageName(this.images.length - 1);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  public setPrimaryImage(index: number, image?: any): void {
    this.form.patchValue({ primary: index });
    this.images.controls.forEach((control, i) => {
      control.patchValue({ isPrimary: i === index });
    });

    this.selectedImageId = image.value.imageId;

    this.updateSelectedImageName(index);
  }

  public deleteImage(index: number, image: any) {
    this.images.removeAt(index);

    if (this.images.length === 0) {
      this.form.patchValue({ primary: index });
      this.selectedImageName.next('Будь ласка, оберіть головне фото');
    } else if (this.form.value.primary >= this.images.length) {
      this.updateSelectedImageName(this.images.length - 1);
    }

    if (!!image.value.imageId) {
      this.imageIds.push(image.value.imageId);
    }
  }

  public prefillForm(product: Product) {
    this.form.controls['title'].reset(product.title);
    this.form.controls['price'].reset(product.price);
    this.form.controls['stock'].reset(product.stock);
    this.form.controls['status_id'].reset(product.status_id);
    this.form.controls['category_id'].reset(product.category_id);
    this.form.controls['product_id'].reset(product.product_id);
    if (!!product.attributes?.length) {
      this.setAttributes(product.attributes);
    }
    if (!!product.images?.length) {
      this.setImages(product?.images);
      const primaryIndex = product.images.findIndex(
        (image) => image.is_primary === true
      );
      this.setPrimaryImage(primaryIndex, this.images.at(primaryIndex));
    }
    this.form.updateValueAndValidity();
  }

  public setImages(images: any[]): void {
    const imagesFormArray = this.images as FormArray;
    if (images?.length) {
      images.forEach((image) => {
        const fullPath = `http://localhost:5500/${image.image_path}`;
        imagesFormArray.push(
          this.fb.group({
            file: [image.file],
            path: [fullPath],
            isPrimary: [image.isPrimary],
            imageId: [image.image_id],
          })
        );
      });
    }
  }

  public setAttributes(attributes: any[]): void {
    if (attributes?.length) {
      attributes.forEach((attr) => {
        if (attr?.values?.length) {
          const mapped = attr.values.map((item: any) => {
            return item.value;
          });
          this.addAttributeControl(attr.key, mapped);
        }
      });
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

  public backToProducts() {
    this.router.navigate(['/manage-products/product-list']);
  }

  public manageFormAfterEdit(result: UpdateProductResponse): void {
    this.images.clear();

    const newImages = result.product.images;
    if (newImages && newImages.length) {
      newImages.forEach((image: any) => {
        const fullPath = `http://localhost:5500/${image.image_path}`;
        const imageGroup = this.fb.group({
          file: [null],
          path: [fullPath],
          isPrimary: [image.is_primary],
          imageId: [image.image_id],
        });
        this.images.push(imageGroup);
      });
    }

    if (this.images.length > 0) {
      this.updateSelectedImageName(0);
    } else {
      this.selectedImageName.next('Будь ласка, оберіть головне фото');
    }
  }

  public mapValuesAttributes(array: any[]) {
    return array.map((item) => ({
      key: item.key,
      values: item.attributeValues.map((item: any) => item.value),
    }));
  }

  public getProductById(id: number) {
    this.loader.start();
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.prefillForm(product);
        this.loader.stop();
      },
      error: (error) => {
        this.loader.stop();
        console.error(error);
      },
    });
  }

  public updateProduct(): void {
    if (this.form.valid) {
      this.loader.start();
      const formData = new FormData();

      formData.append('product_id', this.form.get('product_id')?.value);
      formData.append('title', this.form.get('title')?.value);
      formData.append('description', this.form.get('description')?.value);
      formData.append('price', this.form.get('price')?.value);
      formData.append('stock', this.form.get('stock')?.value);
      formData.append('category_id', this.form.get('category_id')?.value);
      formData.append('status_id', this.form.get('status_id')?.value);
      formData.append('deleteImageIds', JSON.stringify(this.imageIds));

      formData.append('selectedImageId', JSON.stringify(this.selectedImageId));

      const attributes = this.mapValuesAttributes(this.attributes.value);
      if (!!attributes?.length) {
        formData.append('attributes', JSON.stringify(attributes));
      }

      const images = this.images.controls;
      images.forEach((imageControl, index) => {
        const file = imageControl.get('file')!.value;
        if (file) {
          formData.append('images', file, file.name);
        }
      });

      this.productService
        .updateProduct(this.form.value.product_id, formData)
        .pipe(
          catchError((error) => {
            this.loader.stop();
            this.snackBar.open('Помилка при оновленні продукту', 'Закрити', {
              duration: 3000,
            });
            console.error('Помилка при оновленні продукту:', error);
            return throwError(() => error);
          })
        )
        .subscribe({
          next: (result) => {
            this.loader.stop();
            this.snackBar.open('Продукт оновлено успішно', 'Закрити', {
              duration: 3000,
            });
            this.imageIds = [];
            this.selectedImageId = 0;

            this.manageFormAfterEdit(result);
          },
        });
    }
  }
}
