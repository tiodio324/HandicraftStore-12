export type PageId = 'home' | 'catalog' | 'orders' | 'admin' | 'admin-products' | 'admin-categories' | 'admin-orders';
export interface PageConfig { id: PageId; title: string; icon: string; requiresAuth: boolean; requiredRole?: 'seller' | 'admin'; showInNav: boolean; parentId?: PageId; }
export const PAGES_CONFIG: Record<PageId, PageConfig> = {
  home: { id: 'home', title: 'Главная', icon: 'home', requiresAuth: false, showInNav: true },
  catalog: { id: 'catalog', title: 'Каталог', icon: 'grid', requiresAuth: false, showInNav: true },
  orders: { id: 'orders', title: 'Заказы', icon: 'shopping-bag', requiresAuth: true, requiredRole: 'seller', showInNav: true },
  admin: { id: 'admin', title: 'Администрирование', icon: 'settings', requiresAuth: true, requiredRole: 'admin', showInNav: true },
  'admin-products': { id: 'admin-products', title: 'Товары', icon: 'box', requiresAuth: true, requiredRole: 'admin', showInNav: false, parentId: 'admin' },
  'admin-categories': { id: 'admin-categories', title: 'Категории', icon: 'folder', requiresAuth: true, requiredRole: 'admin', showInNav: false, parentId: 'admin' },
  'admin-orders': { id: 'admin-orders', title: 'Заказы', icon: 'clipboard', requiresAuth: true, requiredRole: 'admin', showInNav: false, parentId: 'admin' },
};
