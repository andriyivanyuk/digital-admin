import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    displayName: 'Панель',
    iconName: 'layout-grid-add',
    route: '/dashboard',
  },

  {
    displayName: 'Управління товарами',
    iconName: 'table',
    route: '/manage-products/tables',
    children: [
      {
        displayName: 'Створити продукт',
        iconName: 'archive',
        route: '/manage-products/create-product',
      },
      {
        displayName: 'Badge',
        iconName: 'archive',
        route: '/manage-products/badge',
      },
      {
        displayName: 'Menu',
        iconName: 'file-text',
        route: '/manage-products/menu',
      },
      {
        displayName: 'Tooltips',
        iconName: 'file-text-ai',
        route: '/manage-products/tooltips',
      },
      {
        displayName: 'Forms',
        iconName: 'clipboard-text',
        route: '/manage-products/forms',
      },
    ],
  },
];
