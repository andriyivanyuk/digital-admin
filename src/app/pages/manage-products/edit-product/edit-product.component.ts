import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AttributeDialogComponent } from 'src/app/components/attribute-dialog/attribute-dialog.component';
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
import { MaterialModule } from 'src/app/material.module';
import { ActivatedRoute, Router } from '@angular/router';
import { UpdateImage } from 'src/app/models/updateImage';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss'],
  imports: [
    ReactiveFormsModule,
    TablerIconsModule,
    CommonModule,
    MaterialModule,
    MatDialogModule,
  ],
  providers: [ProductStatusService, CategoryService, ProductService],
})
export class EditProductComponent implements OnInit {
  form!: FormGroup;

  imageActive: boolean = true;

  updatedImages: UpdateImage[] = [];

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

  indexPrimary: number = 0;

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
      title: ['', [Validators.required, Validators.maxLength(255)]],
      price: [null, [Validators.required]],
      stock: [null, [Validators.required]],
      status_id: [0],
      category_id: [0],
      description: [''],
      attributes: this.fb.array([]),
      primaryImageIndex: ['0', Validators.required],
      images: this.fb.array([]),
    });
  }

  selectedImageName: BehaviorSubject<string> = new BehaviorSubject<string>(
    'не вибрано'
  );

  public setPrimaryImage(index: number, image?: any): void {
    this.form.patchValue({ primaryImageIndex: index });
    this.images.controls.forEach((control, i) => {
      control.patchValue({ isPrimary: i === index });
    });

    this.updatedImages = this.combineArrays(
      this.form.value.images,
      this.updatedImages
    );

    const condition = index - this.updatedImages.length;

    if (condition >= 0) {
      this.indexPrimary = condition;
    }

    this.updateSelectedImageName(index);
  }

  public deleteImage(index: number, image: any) {
    this.images.removeAt(index);

    this.setPrimaryImage(0, this.images.at(0));

    if (this.images.length === 0) {
      this.form.patchValue({ primaryImageIndex: index });
      this.selectedImageName.next('Будь ласка, оберіть головне фото');
    } else if (this.form.value.primaryImageIndex >= this.images.length) {
      this.updateSelectedImageName(this.images.length - 1);
    }

    this.updatedImages = this.combineArrays(
      this.form.value.images,
      this.updatedImages,
      [index]
    );
  }

  public combineArrays(arr1: any[], arr2: any[], deleteIndexes: number[] = []) {
    return arr2.map((item2, index) => {
      const fileName = item2.path.split('\\').pop();
      const item1 = arr1.find((item1) => item1.path.includes(fileName));

      return {
        path: item2.path,
        isPrimary: item1?.isPrimary ?? false,
        toDelete: deleteIndexes.includes(index),
      };
    });
  }

  private mapUpdatedImages(images: any): UpdateImage[] {
    return images?.map((img: any) => {
      return {
        path: img.path
          .replace('http://localhost:5000/', '')
          .replace(/\\/g, '\\'),
        isPrimary: !!img.isPrimary,
        toDelete: false,
      };
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

  public prefillForm(product: any) {
    this.form.controls['title'].reset(product.title);
    this.form.controls['price'].reset(product.price);
    this.form.controls['stock'].reset(product.stock);
    this.form.controls['status_id'].reset(product.status_id);
    this.form.controls['category_id'].reset(product.category_id);
    this.form.controls['product_id'].reset(product.product_id);
    this.setAttributes(product?.attributes);
    this.setImages(product?.images);
  }

  private updateSelectedImageName(index: number) {
    const image = this.images.at(index);
    const imageName = image
      ? `Фото ${parseInt(index.toString(), 10) + 1}`
      : 'Будь ласка, оберіть головне фото';
    this.selectedImageName.next(imageName);
    this.form.patchValue({ primaryImageIndex: index });
  }

  public backToProducts() {
    this.router.navigate(['/manage-products/product-list']);
  }

  public getProductById(id: number) {
    this.loader.start();
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.prefillForm(product);
        this.updatedImages = this.mapUpdatedImages(
          this.form.controls['images'].value
        );
        this.loader.stop();
      },
      error: (error) => {
        this.loader.stop();
        console.error(error);
      },
    });
  }

  public setAttributes(attributes: any[]): void {
    if (attributes?.length) {
      const attributesFormArray = this.attributes as FormArray;
      attributes.forEach((attr) => {
        attributesFormArray.push(
          this.fb.group({
            key: [attr.key, Validators.required],
            value: [attr.value, Validators.required],
          })
        );
      });
    }
  }

  public setImages(images: any[]): void {
    const imagesFormArray = this.images as FormArray;
    if (images?.length) {
      images.forEach((image) => {
        const fullPath = `http://localhost:5000/${image.image_path}`;
        imagesFormArray.push(
          this.fb.group({
            file: [image.file],
            path: [fullPath],
            isPrimary: [image.isPrimary],
          })
        );
      });
    }
  }

  public onFileSelect(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let files = element.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const fileName = file.name;
        const isAlreadyLoaded = this.images.controls.some((item) => {
          return item.value.path.includes(fileName);
        });
        if (!isAlreadyLoaded) {
          let reader = new FileReader();
          reader.onload = (e: any) => {
            this.images.push(
              this.fb.group({
                file: [file],
                path: [e.target.result],
              })
            );

            this.updateSelectedImageName(this.images.length - 1);
            console.log(this.images);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  public updateProduct(): void {
    if (this.form.valid) {
      // this.loader.start();
      const formData = new FormData();

      formData.append('product_id', this.form.get('product_id')?.value);
      formData.append('title', this.form.get('title')?.value);
      formData.append('description', this.form.get('description')?.value);
      formData.append('price', this.form.get('price')?.value);
      formData.append('stock', this.form.get('stock')?.value);
      formData.append('category_id', this.form.get('category_id')?.value);
      formData.append('status_id', this.form.get('status_id')?.value);

      const images = this.images.controls;
      images.forEach((imageControl, _) => {
        const file = imageControl.get('file')!.value;

        if (!!file) {
          formData.append('images', file, file.name);
        }
      });

      console.log(this.images.value);

      formData.append('primary', this.indexPrimary.toString());

      formData.append('updatedImages', JSON.stringify(this.updatedImages));

      this.form.value.attributes.forEach((attr: any, index: number) => {
        formData.append(`attributes[${index}][key]`, attr.key);
        formData.append(`attributes[${index}][value]`, attr.value);
      });

      this.productService
        .updateProduct(this.form.value.product_id, formData)
        .subscribe({
          next: () => {
            this.loader.stop();
            this.snackBar.open('Продукт оновлено успішно', 'Закрити', {
              duration: 3000,
            });
            this.imageActive = false;
          },
          error: (error) => {
            this.loader.stop();
            console.error('Помилка при оновленні продукту:', error);
            this.snackBar.open('Помилка при оновленні продукту', 'Закрити', {
              duration: 3000,
            });
          },
        });
    }
  }
}
