import { Routes } from '@angular/router';

// ui
import { AppBadgeComponent } from './badge/badge.component';
import { AppMenuComponent } from './menu/menu.component';
import { AppTooltipsComponent } from './tooltips/tooltips.component';
import { AppFormsComponent } from './forms/forms.component';
import { AppTablesComponent } from './tables/tables.component';
import { CreateProductComponent } from './create-product/create-product.component';
import { CreateCategoryComponent } from './create-category/create-category.component';
import { ProductListComponent } from './product-list/product-list.component';
import { EditProductComponent } from './edit-product/edit-product.component';

export const manageProductsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'create-product',
        component: CreateProductComponent,
      },
      {
        path: 'create-category',
        component: CreateCategoryComponent,
      },
      {
        path: 'edit-product/:id',
        component: EditProductComponent,
      },
      {
        path: 'product-list',
        component: ProductListComponent,
      },
      {
        path: 'badge',
        component: AppBadgeComponent,
      },
      {
        path: 'menu',
        component: AppMenuComponent,
      },
      {
        path: 'tooltips',
        component: AppTooltipsComponent,
      },
      {
        path: 'forms',
        component: AppFormsComponent,
      },
      {
        path: 'tables',
        component: AppTablesComponent,
      },
    ],
  },
];
