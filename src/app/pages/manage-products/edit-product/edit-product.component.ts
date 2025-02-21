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

  get attributes(): FormArray {
    return this.form.get('attributes') as FormArray;
  }

  get images(): FormArray {
    return this.form.get('images') as FormArray;
  }

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
    // const deletedPath = image.get('path')!.value.split('\\').pop();
    this.form.patchValue({ primaryImageIndex: index });
    this.images.controls.forEach((control, i) => {
      console.log(i, index);
      control.patchValue({ isPrimary: i === index });
    });

    console.log(this.form.value.images, 'AFTER SETING MAIN');
    // this.updatedImages = this.mapUpdatedImages(
    //   this.form.controls['images'].value
    // );

    // console.log(this.updatedImages, 'AFTER ASSIGNING MAIN FOTO', deletedPath);

    this.updateSelectedImageName(index);
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
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        console.log(product);
        this.prefillForm(product);
        this.updatedImages = this.mapUpdatedImages(
          this.form.controls['images'].value
        );
      },
      error: (error) => {
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
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  public deleteImage(index: number, image: any) {
    const deletedPath = image.get('path')!.value.split('\\').pop();

    this.images.removeAt(index);

    // this.updatedImages = this.updatedImages.map((img) => ({
    //   ...img,
    //   toDelete: img.path.includes(deletedPath) ? true : img.toDelete,
    // }));
    this.setPrimaryImage(index);

    if (this.images.length === 0) {
      this.form.patchValue({ primaryImageIndex: index });
      this.selectedImageName.next('Будь ласка, оберіть головне фото');
    } else if (this.form.value.primaryImageIndex >= this.images.length) {
      this.updateSelectedImageName(this.images.length - 1);
    }

    console.log(this.form.value.images, 'AFTER DELETING MAIN');
  }

  public updateProduct(): void {
    if (this.form.valid) {
      const formData = new FormData();

      formData.append('product_id', this.form.get('product_id')?.value);
      formData.append('title', this.form.get('title')?.value);
      formData.append('description', this.form.get('description')?.value);
      formData.append('price', this.form.get('price')?.value);
      formData.append('stock', this.form.get('stock')?.value);
      formData.append('category_id', this.form.get('category_id')?.value);
      formData.append('status_id', this.form.get('status_id')?.value);

      const images = this.images.controls;
      images.forEach((imageControl, index) => {
        const file = imageControl.get('file')!.value;

        if (!!file) {
          formData.append('images', file, file.name);
        }
        if (
          index.toString() ===
          this.form.get('primaryImageIndex')!.value.toString()
        ) {
          formData.append('primary', index.toString());
        }
      });

      const updatedArray = this.updatedImages.map((item) => ({
        ...item,
        path: item.path.replace(/\\/g, '\\'),
      }));

      console.log(updatedArray, 'UPDATED ARRAY RESULT');

      formData.append('updatedImages', JSON.stringify(updatedArray));

      this.form.value.attributes.forEach((attr: any, index: number) => {
        formData.append(`attributes[${index}][key]`, attr.key);
        formData.append(`attributes[${index}][value]`, attr.value);
      });

      this.productService
        .updateProduct(this.form.value.product_id, formData)
        .subscribe({
          next: () => {
            this.snackBar.open('Продукт оновлено успішно', 'Закрити', {
              duration: 3000,
            });
          },
          error: (error) => {
            console.error('Помилка при оновленні продукту:', error);
            this.snackBar.open('Помилка при оновленні продукту', 'Закрити', {
              duration: 3000,
            });
          },
        });
    }
  }
}
