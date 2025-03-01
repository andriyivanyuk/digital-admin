import { Routes } from '@angular/router';

import { OrderListComponent } from './order-list/order-list.component';
import { OrderDetailsComponent } from './order-details/order-details.component';

export const manageOrdersRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'order-list',
        component: OrderListComponent,
      },
      {
        path: 'order-details/:orderId',
        component: OrderDetailsComponent,
      },
    ],
  },
];
