import { Routes } from '@angular/router';
import { CategoryListComponent } from './category-list/category-list.component';
import { CreateCategoryComponent } from './create-category/create-category.component';
import { CategoryDetailsComponent } from './category-details/category-details.component';

export const categoryRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'category-list',
        component: CategoryListComponent,
      },
      {
        path: 'create-category',
        component: CreateCategoryComponent,
      },
      {
        path: 'category-details/:id',
        component: CategoryDetailsComponent,
      },
    ],
  },
];
