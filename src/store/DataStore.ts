import { makeAutoObservable, runInAction } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { Product, ProductFormData, Category, CategoryFormData, Order, OrderFormData, OrderStatus, FilterParams } from '@/types';
import FirebaseService from '@/firebase';
import { authStore } from './AuthStore';

export class DataStore {
  products: Product[] = []; categories: Category[] = []; orders: Order[] = [];
  productsLoading = false; categoriesLoading = false; ordersLoading = false;
  error: string | null = null; filters: FilterParams = {};

  constructor() { makeAutoObservable(this, {}, { autoBind: true }); }

  get activeProducts(): Product[] { return this.products.filter(p => p.isActive).sort((a, b) => a.name.localeCompare(b.name, 'ru')); }
  get activeCategories(): Category[] { return this.categories.filter(c => c.isActive).sort((a, b) => a.name.localeCompare(b.name, 'ru')); }
  get activeOrders(): Order[] { return this.orders.filter(o => o.isActive).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); }
  
  get filteredProducts(): Product[] {
    let r = this.activeProducts;
    if (this.filters.categoryId) r = r.filter(p => p.categoryId === this.filters.categoryId);
    if (this.filters.search) { const s = this.filters.search.toLowerCase(); r = r.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s)); }
    if (this.filters.minPrice) r = r.filter(p => p.price >= this.filters.minPrice!);
    if (this.filters.maxPrice) r = r.filter(p => p.price <= this.filters.maxPrice!);
    return r;
  }

  get pendingOrdersCount(): number { return this.activeOrders.filter(o => o.status === 'pending').length; }
  get totalRevenue(): number { return this.activeOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0); }

  getCategoryById = (id: string): Category | undefined => this.categories.find(c => c.id === id);
  getProductById = (id: string): Product | undefined => this.products.find(p => p.id === id);

  loadAllData = async (): Promise<void> => { await Promise.all([this.loadProducts(), this.loadCategories(), this.loadOrders()]); };

  loadProducts = async (): Promise<void> => { this.productsLoading = true; try { const d = await FirebaseService.getData<Record<string, Product>>('products'); runInAction(() => { this.products = d ? Object.values(d) : []; this.productsLoading = false; }); } catch { runInAction(() => { this.error = 'Ошибка загрузки товаров'; this.productsLoading = false; }); } };
  loadCategories = async (): Promise<void> => { this.categoriesLoading = true; try { const d = await FirebaseService.getData<Record<string, Category>>('categories'); runInAction(() => { this.categories = d ? Object.values(d) : []; this.categoriesLoading = false; }); } catch { runInAction(() => { this.error = 'Ошибка загрузки категорий'; this.categoriesLoading = false; }); } };
  loadOrders = async (): Promise<void> => { this.ordersLoading = true; try { const d = await FirebaseService.getData<Record<string, Order>>('orders'); runInAction(() => { this.orders = d ? Object.values(d) : []; this.ordersLoading = false; }); } catch { runInAction(() => { this.error = 'Ошибка загрузки заказов'; this.ordersLoading = false; }); } };

  createProduct = async (data: ProductFormData): Promise<Product | null> => { if (!authStore.canManageProducts()) return null; const now = new Date().toISOString(); const p: Product = { id: uuidv4(), ...data, imageUrl: data.imageUrl || '', isActive: true, createdAt: now, updatedAt: now }; try { await FirebaseService.setData(`products/${p.id}`, p); runInAction(() => { this.products.push(p); }); return p; } catch { return null; } };
  updateProduct = async (id: string, data: Partial<ProductFormData>): Promise<boolean> => { if (!authStore.canManageProducts()) return false; const i = this.products.findIndex(p => p.id === id); if (i === -1) return false; const u = { ...this.products[i], ...data, updatedAt: new Date().toISOString() }; try { await FirebaseService.setData(`products/${id}`, u); runInAction(() => { this.products[i] = u; }); return true; } catch { return false; } };
  deleteProduct = async (id: string): Promise<boolean> => { if (!authStore.canManageProducts()) return false; const i = this.products.findIndex(p => p.id === id); if (i === -1) return false; try { await FirebaseService.updateData(`products/${id}`, { isActive: false }); runInAction(() => { this.products[i].isActive = false; }); return true; } catch { return false; } };

  createCategory = async (data: CategoryFormData): Promise<Category | null> => { if (!authStore.canManageCategories()) return null; const now = new Date().toISOString(); const c: Category = { id: uuidv4(), ...data, description: data.description || '', isActive: true, createdAt: now, updatedAt: now }; try { await FirebaseService.setData(`categories/${c.id}`, c); runInAction(() => { this.categories.push(c); }); return c; } catch { return null; } };
  updateCategory = async (id: string, data: Partial<CategoryFormData>): Promise<boolean> => { if (!authStore.canManageCategories()) return false; const i = this.categories.findIndex(c => c.id === id); if (i === -1) return false; const u = { ...this.categories[i], ...data, updatedAt: new Date().toISOString() }; try { await FirebaseService.setData(`categories/${id}`, u); runInAction(() => { this.categories[i] = u; }); return true; } catch { return false; } };
  deleteCategory = async (id: string): Promise<boolean> => { if (!authStore.canManageCategories()) return false; const i = this.categories.findIndex(c => c.id === id); if (i === -1) return false; try { await FirebaseService.updateData(`categories/${id}`, { isActive: false }); runInAction(() => { this.categories[i].isActive = false; }); return true; } catch { return false; } };

  createOrder = async (data: OrderFormData): Promise<Order | null> => { const now = new Date().toISOString(); const total = data.items.reduce((s, i) => s + i.price * i.quantity, 0); const o: Order = { id: uuidv4(), ...data, total, status: 'pending', isActive: true, createdAt: now, updatedAt: now }; try { await FirebaseService.setData(`orders/${o.id}`, o); runInAction(() => { this.orders.push(o); }); return o; } catch { return null; } };
  updateOrderStatus = async (id: string, status: OrderStatus): Promise<boolean> => { if (!authStore.canManageOrders()) return false; const i = this.orders.findIndex(o => o.id === id); if (i === -1) return false; const u = { ...this.orders[i], status, updatedAt: new Date().toISOString() }; try { await FirebaseService.setData(`orders/${id}`, u); runInAction(() => { this.orders[i] = u; }); return true; } catch { return false; } };
  deleteOrder = async (id: string): Promise<boolean> => { if (!authStore.canManageOrders()) return false; const i = this.orders.findIndex(o => o.id === id); if (i === -1) return false; try { await FirebaseService.updateData(`orders/${id}`, { isActive: false }); runInAction(() => { this.orders[i].isActive = false; }); return true; } catch { return false; } };

  setFilter = (key: keyof FilterParams, value: string | number | undefined): void => { this.filters = { ...this.filters, [key]: value }; };
  clearFilters = (): void => { this.filters = {}; };
  clearError = (): void => { this.error = null; };
}

export const dataStore = new DataStore();
