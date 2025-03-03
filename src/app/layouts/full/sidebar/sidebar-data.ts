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
    navCap: 'Замовлення',
  },
  {
    displayName: 'Список замовлень',
    iconName: 'list',
    route: '/orders/order-list',
  },

  {
    navCap: 'Управління продуктом',
  },
  {
    displayName: 'Список продуктів',
    iconName: 'list',
    route: '/manage-products/product-list',
  },
  {
    displayName: 'Створити продукт',
    iconName: 'circle-plus',
    route: '/manage-products/create-product',
  },

  {
    navCap: 'Управління категоріями',
  },

  {
    displayName: 'Список категорій',
    iconName: 'list',
    route: '/categories/category-list',
  },

  {
    displayName: 'Створити категорію',
    iconName: 'folder-plus',
    route: '/categories/create-category',
  },

  // {
  //   navCap: 'Елементи',
  // },

  // {
  //   displayName: 'Badge',
  //   iconName: 'archive',
  //   route: '/manage-products/badge',
  // },
  // {
  //   displayName: 'Menu',
  //   iconName: 'file-text',
  //   route: '/manage-products/menu',
  // },
  // {
  //   displayName: 'Tooltips',
  //   iconName: 'file-text-ai',
  //   route: '/manage-products/tooltips',
  // },
  // {
  //   displayName: 'Forms',
  //   iconName: 'clipboard-text',
  //   route: '/manage-products/forms',
  // },
  // {
  //   displayName: 'Tables',
  //   iconName: 'clipboard-text',
  //   route: '/manage-products/tables',
  // },
];
