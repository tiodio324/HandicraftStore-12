import { makeAutoObservable } from 'mobx';
import { PageId, PAGES_CONFIG, PageConfig } from '@/types';
import { authStore } from './AuthStore';

export class NavigationStore {
  currentPage: PageId = 'home';
  sidebarOpen = true;
  mobileMenuOpen = false;

  constructor() { makeAutoObservable(this, {}, { autoBind: true }); }

  get currentPageConfig(): PageConfig { return PAGES_CONFIG[this.currentPage]; }
  get pageTitle(): string { return this.currentPageConfig?.title || ''; }
  get navigationItems(): PageConfig[] {
    return Object.values(PAGES_CONFIG).filter(page => {
      if (!page.showInNav) return false;
      if (page.requiresAuth && !authStore.isAuthenticated) return false;
      if (page.requiredRole === 'admin' && !authStore.isAdmin) return false;
      if (page.requiredRole === 'seller' && !authStore.isSeller) return false;
      return true;
    });
  }

  navigate = (pageId: PageId): void => {
    const config = PAGES_CONFIG[pageId];
    if (config.requiresAuth && !authStore.isAuthenticated) { authStore.openLoginModal(); return; }
    if (config.requiredRole === 'admin' && !authStore.isAdmin) return;
    if (config.requiredRole === 'seller' && !authStore.isSeller) return;
    this.currentPage = pageId;
    this.closeMobileMenu();
  };

  toggleSidebar = (): void => { this.sidebarOpen = !this.sidebarOpen; };
  toggleMobileMenu = (): void => { this.mobileMenuOpen = !this.mobileMenuOpen; };
  closeMobileMenu = (): void => { this.mobileMenuOpen = false; };
}

export const navigationStore = new NavigationStore();
