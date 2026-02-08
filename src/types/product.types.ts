export interface Product { id: string; name: string; description: string; price: number; categoryId: string; imageUrl?: string; stock: number; isActive: boolean; createdAt: string; updatedAt: string; }
export interface ProductFormData { name: string; description: string; price: number; categoryId: string; imageUrl?: string; stock: number; }
