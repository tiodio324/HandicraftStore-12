export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export interface OrderItem { productId: string; productName: string; quantity: number; price: number; }
export interface Order { id: string; customerName: string; customerEmail: string; customerPhone: string; items: OrderItem[]; total: number; status: OrderStatus; address: string; isActive: boolean; createdAt: string; updatedAt: string; }
export interface OrderFormData { customerName: string; customerEmail: string; customerPhone: string; items: OrderItem[]; address: string; }
export const getOrderStatusLabel = (s: OrderStatus): string => ({ pending: 'Ожидает', processing: 'В обработке', shipped: 'Отправлен', delivered: 'Доставлен', cancelled: 'Отменён' }[s]);
