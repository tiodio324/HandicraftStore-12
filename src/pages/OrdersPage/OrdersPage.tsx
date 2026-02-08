import { observer } from 'mobx-react-lite';
import { dataStore, uiStore } from '@/store';
import { Card, Button, Table, Badge, Select } from '@/components/UI';
import type { TableColumn } from '@/components/UI';
import type { Order, OrderStatus } from '@/types';
import { getOrderStatusLabel } from '@/types';
import styles from './OrdersPage.module.scss';

const statusOptions = [
  { value: '', label: 'Все статусы' },
  { value: 'pending', label: 'Ожидает' }, { value: 'processing', label: 'В обработке' },
  { value: 'shipped', label: 'Отправлен' }, { value: 'delivered', label: 'Доставлен' }, { value: 'cancelled', label: 'Отменён' },
];

export const OrdersPage = observer(() => {
  const { activeOrders, ordersLoading, updateOrderStatus, deleteOrder, setFilter, filters } = dataStore;

  const filteredOrders = filters.status ? activeOrders.filter(o => o.status === filters.status) : activeOrders;

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    const success = await updateOrderStatus(id, status);
    if (success) uiStore.showSuccess('Статус обновлён'); else uiStore.showError('Ошибка обновления');
  };

  const handleDelete = (id: string) => {
    uiStore.showConfirm('Удаление заказа', 'Удалить этот заказ?', async () => { await deleteOrder(id); uiStore.showSuccess('Заказ удалён'); });
  };

  const getStatusBadgeVariant = (s: OrderStatus): 'primary' | 'success' | 'warning' | 'info' | 'error' => {
    return { pending: 'warning', processing: 'info', shipped: 'primary', delivered: 'success', cancelled: 'error' }[s] as 'primary' | 'success' | 'warning' | 'info' | 'error';
  };

  const columns: TableColumn<Order>[] = [
    { key: 'id', title: 'ID', width: '100px', render: (v: unknown) => (v as string).substring(0, 8) + '...' },
    { key: 'createdAt', title: 'Дата', width: '100px', render: (v: unknown) => new Date(v as string).toLocaleDateString('ru-RU') },
    { key: 'customerName', title: 'Клиент' },
    { key: 'items', title: 'Товаров', width: '90px', render: (v: unknown) => (v as Order['items']).length },
    { key: 'total', title: 'Сумма', width: '110px', render: (v: unknown) => `${(v as number).toLocaleString('ru-RU')} ₽` },
    { key: 'status', title: 'Статус', width: '140px', render: (v: unknown) => <Badge variant={getStatusBadgeVariant(v as OrderStatus)}>{getOrderStatusLabel(v as OrderStatus)}</Badge> },
    { key: 'actions', title: '', width: '200px', render: (_: unknown, row: Order) => (
      <div className={styles.actions}>
        <Select options={statusOptions.filter(o => o.value)} value={row.status} onChange={e => handleStatusChange(row.id, e.target.value as OrderStatus)} />
        <Button size="sm" variant="ghost" onClick={() => handleDelete(row.id)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
        </Button>
      </div>
    )},
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div><h1 className={styles.title}>Заказы</h1><p className={styles.subtitle}>Управление заказами магазина</p></div>
      </div>

      <Card className={styles.filters}>
        <Select options={statusOptions} value={filters.status || ''} onChange={e => setFilter('status', e.target.value || undefined)} label="Фильтр по статусу" />
      </Card>

      <Card padding="none">
        <Table columns={columns} data={filteredOrders} keyField="id" loading={ordersLoading} emptyText="Нет заказов" />
      </Card>
    </div>
  );
});
