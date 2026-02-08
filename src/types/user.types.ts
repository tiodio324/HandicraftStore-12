export type UserRole = 'viewer' | 'seller' | 'admin';
export interface User { role: UserRole; }
export interface RolePermissions { canViewProducts: boolean; canViewOrders: boolean; canManageProducts: boolean; canManageOrders: boolean; canManageCategories: boolean; canAccessAdmin: boolean; }
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  viewer: { canViewProducts: true, canViewOrders: false, canManageProducts: false, canManageOrders: false, canManageCategories: false, canAccessAdmin: false },
  seller: { canViewProducts: true, canViewOrders: true, canManageProducts: true, canManageOrders: true, canManageCategories: false, canAccessAdmin: false },
  admin: { canViewProducts: true, canViewOrders: true, canManageProducts: true, canManageOrders: true, canManageCategories: true, canAccessAdmin: true },
};
