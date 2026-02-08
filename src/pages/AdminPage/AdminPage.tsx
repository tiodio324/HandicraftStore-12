import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { dataStore, uiStore } from '@/store';
import { Card, Button, Table, Modal, Input, Select } from '@/components/UI';
import type { TableColumn } from '@/components/UI';
import type { Product, Category, Order, ProductFormData, CategoryFormData, OrderStatus } from '@/types';
import { getOrderStatusLabel } from '@/types';
import styles from './AdminPage.module.scss';

type AdminTab = 'products' | 'categories' | 'orders';

export const AdminPage = observer(() => {
  const { products, categories, orders, activeCategories, productsLoading, categoriesLoading, ordersLoading, getCategoryById,
    createProduct, updateProduct, deleteProduct, createCategory, updateCategory, deleteCategory, deleteOrder } = dataStore;
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [productForm, setProductForm] = useState<ProductFormData>({ name: '', description: '', price: 0, categoryId: '', stock: 0, imageUrl: '' });
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({ name: '', description: '' });

  const resetForms = () => { setProductForm({ name: '', description: '', price: 0, categoryId: '', stock: 0, imageUrl: '' }); setCategoryForm({ name: '', description: '' }); setEditingId(null); };

  const openCreateModal = () => { resetForms(); setModalMode('create'); setModalOpen(true); };
  const openEditModal = (item: Product | Category) => {
    setModalMode('edit'); setEditingId(item.id);
    if (activeTab === 'products') { const p = item as Product; setProductForm({ name: p.name, description: p.description, price: p.price, categoryId: p.categoryId, stock: p.stock, imageUrl: p.imageUrl || '' }); }
    else if (activeTab === 'categories') { const c = item as Category; setCategoryForm({ name: c.name, description: c.description || '' }); }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (activeTab === 'products') {
        if (!productForm.name || !productForm.categoryId) { uiStore.showError('Заполните обязательные поля'); return; }
        if (modalMode === 'create') await createProduct(productForm); else if (editingId) await updateProduct(editingId, productForm);
      } else if (activeTab === 'categories') {
        if (!categoryForm.name) { uiStore.showError('Введите название'); return; }
        if (modalMode === 'create') await createCategory(categoryForm); else if (editingId) await updateCategory(editingId, categoryForm);
      }
      uiStore.showSuccess(modalMode === 'create' ? 'Добавлено' : 'Обновлено');
      setModalOpen(false); resetForms();
    } catch { uiStore.showError('Ошибка'); }
  };

  const handleDelete = (id: string) => { uiStore.showConfirm('Удаление', 'Удалить?', async () => {
    if (activeTab === 'products') await deleteProduct(id); else if (activeTab === 'categories') await deleteCategory(id); else await deleteOrder(id);
    uiStore.showSuccess('Удалено');
  }); };

  const actionButtons = (row: Product | Category | Order) => (
    <div className={styles.actions}>
      {activeTab !== 'orders' && <Button size="sm" variant="ghost" onClick={() => openEditModal(row as Product | Category)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></Button>}
      <Button size="sm" variant="ghost" onClick={() => handleDelete(row.id)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg></Button>
    </div>
  );

  const productColumns: TableColumn<Product>[] = [
    { key: 'name', title: 'Название' },
    { key: 'categoryId', title: 'Категория', render: (v: unknown) => getCategoryById(v as string)?.name || '—' },
    { key: 'price', title: 'Цена', width: '100px', render: (v: unknown) => `${(v as number).toLocaleString('ru-RU')} ₽` },
    { key: 'stock', title: 'Остаток', width: '80px' },
    { key: 'actions', title: '', width: '100px', render: (_: unknown, r: Product) => actionButtons(r) },
  ];

  const categoryColumns: TableColumn<Category>[] = [
    { key: 'name', title: 'Название' },
    { key: 'description', title: 'Описание', render: (v: unknown) => (v as string)?.substring(0, 50) || '—' },
    { key: 'actions', title: '', width: '100px', render: (_: unknown, r: Category) => actionButtons(r) },
  ];

  const orderColumns: TableColumn<Order>[] = [
    { key: 'id', title: 'ID', width: '100px', render: (v: unknown) => (v as string).substring(0, 8) },
    { key: 'customerName', title: 'Клиент' },
    { key: 'total', title: 'Сумма', width: '100px', render: (v: unknown) => `${(v as number).toLocaleString('ru-RU')} ₽` },
    { key: 'status', title: 'Статус', render: (v: unknown) => getOrderStatusLabel(v as OrderStatus) },
    { key: 'actions', title: '', width: '60px', render: (_: unknown, r: Order) => actionButtons(r) },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}><h1 className={styles.title}>Администрирование</h1><p className={styles.subtitle}>Управление магазином</p></div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'products' ? styles.active : ''}`} onClick={() => setActiveTab('products')}>Товары</button>
        <button className={`${styles.tab} ${activeTab === 'categories' ? styles.active : ''}`} onClick={() => setActiveTab('categories')}>Категории</button>
        <button className={`${styles.tab} ${activeTab === 'orders' ? styles.active : ''}`} onClick={() => setActiveTab('orders')}>Заказы</button>
      </div>

      {activeTab !== 'orders' && <Card className={styles.toolbar}><Button variant="primary" onClick={openCreateModal}>Добавить {activeTab === 'products' ? 'товар' : 'категорию'}</Button></Card>}

      <Card padding="none">
        {activeTab === 'products' && <Table columns={productColumns} data={products.filter(p => p.isActive)} keyField="id" loading={productsLoading} emptyText="Нет товаров" />}
        {activeTab === 'categories' && <Table columns={categoryColumns} data={categories.filter(c => c.isActive)} keyField="id" loading={categoriesLoading} emptyText="Нет категорий" />}
        {activeTab === 'orders' && <Table columns={orderColumns} data={orders.filter(o => o.isActive)} keyField="id" loading={ordersLoading} emptyText="Нет заказов" />}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalMode === 'create' ? 'Добавить' : 'Редактировать'}
        footer={<div className={styles.modalFooter}><Button variant="ghost" onClick={() => setModalOpen(false)}>Отмена</Button><Button variant="primary" onClick={handleSave}>Сохранить</Button></div>}>
        <div className={styles.form}>
          {activeTab === 'products' && (<>
            <Input label="Название *" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
            <Input label="Описание" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} />
            <Select label="Категория *" options={activeCategories.map(c => ({ value: c.id, label: c.name }))} value={productForm.categoryId} onChange={e => setProductForm({ ...productForm, categoryId: e.target.value })} />
            <div className={styles.row}><Input label="Цена (₽)" type="number" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })} />
            <Input label="Количество" type="number" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })} /></div>
            <Input label="URL изображения" value={productForm.imageUrl || ''} onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })} />
          </>)}
          {activeTab === 'categories' && (<>
            <Input label="Название *" value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} />
            <Input label="Описание" value={categoryForm.description || ''} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} />
          </>)}
        </div>
      </Modal>
    </div>
  );
});
