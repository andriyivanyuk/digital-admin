import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Головна',
  },
  {
    displayName: 'Панель',
    iconName: 'layout-grid-add',
    route: '/dashboard',
  },

  {
    navCap: 'Управління продуктом',
  },
  {
    displayName: 'Створити продукт',
    iconName: 'circle-plus',
    route: '/manage-products/create-product',
  },
  {
    displayName: 'Створити категорію',
    iconName: 'folder-plus',
    route: '/manage-products/create-category',
  },

  {
    navCap: 'Елементи',
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
];
