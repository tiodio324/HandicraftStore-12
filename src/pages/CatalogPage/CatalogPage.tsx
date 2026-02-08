import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { dataStore, authStore, uiStore } from '@/store';
import { Card, Button, Input, Select, Badge, Modal } from '@/components/UI';
import type { Product, ProductFormData, OrderFormData } from '@/types';
import { isValidEmail, isValidPhone, isNotEmpty } from '@/utils';
import styles from './CatalogPage.module.scss';

interface OrderFormState {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  quantity: number;
}

const initialOrderForm: OrderFormState = { customerName: '', customerEmail: '', customerPhone: '', address: '', quantity: 1 };

export const CatalogPage = observer(() => {
  const { filteredProducts, activeCategories, productsLoading, getCategoryById, createProduct, updateProduct, deleteProduct, setFilter, filters, createOrder } = dataStore;
  const { isSeller } = authStore;
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormData>({ name: '', description: '', price: 0, categoryId: '', stock: 0, imageUrl: '' });

  // Order modal state
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderProduct, setOrderProduct] = useState<Product | null>(null);
  const [orderForm, setOrderForm] = useState<OrderFormState>(initialOrderForm);
  const [orderLoading, setOrderLoading] = useState(false);

  const resetForm = () => { setForm({ name: '', description: '', price: 0, categoryId: '', stock: 0, imageUrl: '' }); setEditingId(null); };
  const openCreateModal = () => { resetForm(); setModalMode('create'); setModalOpen(true); };
  const openEditModal = (p: Product) => {
    setModalMode('edit'); setEditingId(p.id);
    setForm({ name: p.name, description: p.description, price: p.price, categoryId: p.categoryId, stock: p.stock, imageUrl: p.imageUrl || '' });
    setModalOpen(true);
  };

  const openOrderModal = (p: Product) => {
    setOrderProduct(p);
    setOrderForm(initialOrderForm);
    setOrderModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.categoryId) { uiStore.showError('Заполните обязательные поля'); return; }
    try {
      if (modalMode === 'create') await createProduct(form); else if (editingId) await updateProduct(editingId, form);
      uiStore.showSuccess(modalMode === 'create' ? 'Товар добавлен' : 'Товар обновлён');
      setModalOpen(false); resetForm();
    } catch { uiStore.showError('Ошибка сохранения'); }
  };

  const handleDelete = (id: string) => {
    uiStore.showConfirm('Удаление товара', 'Удалить этот товар?', async () => { await deleteProduct(id); uiStore.showSuccess('Товар удалён'); });
  };

  const handleOrder = async () => {
    if (!orderProduct) return;
    if (!isNotEmpty(orderForm.customerName)) { uiStore.showError('Введите ваше имя'); return; }
    if (!isNotEmpty(orderForm.customerEmail) || !isValidEmail(orderForm.customerEmail)) { uiStore.showError('Введите корректный email'); return; }
    if (!isNotEmpty(orderForm.customerPhone) || !isValidPhone(orderForm.customerPhone)) { uiStore.showError('Введите корректный телефон'); return; }
    if (!isNotEmpty(orderForm.address)) { uiStore.showError('Введите адрес доставки'); return; }
    if (orderForm.quantity < 1 || orderForm.quantity > orderProduct.stock) { uiStore.showError(`Укажите количество от 1 до ${orderProduct.stock}`); return; }

    setOrderLoading(true);
    try {
      const orderData: OrderFormData = {
        customerName: orderForm.customerName,
        customerEmail: orderForm.customerEmail,
        customerPhone: orderForm.customerPhone,
        address: orderForm.address,
        items: [{ productId: orderProduct.id, productName: orderProduct.name, quantity: orderForm.quantity, price: orderProduct.price }],
      };
      const result = await createOrder(orderData);
      if (result) {
        uiStore.showSuccess('Заказ успешно оформлен!');
        setOrderModalOpen(false);
        setOrderProduct(null);
        setOrderForm(initialOrderForm);
      } else {
        uiStore.showError('Ошибка при оформлении заказа');
      }
    } catch {
      uiStore.showError('Ошибка при оформлении заказа');
    } finally {
      setOrderLoading(false);
    }
  };

  const categoryOptions = [{ value: '', label: 'Все категории' }, ...activeCategories.map(c => ({ value: c.id, label: c.name }))];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div><h1 className={styles.title}>Каталог товаров</h1><p className={styles.subtitle}>Товары для рукоделия и творчества</p></div>
        {isSeller && <Button variant="primary" onClick={openCreateModal}>Добавить товар</Button>}
      </div>

      <Card className={styles.filters}>
        <Input placeholder="Поиск товаров..." value={filters.search || ''} onChange={e => setFilter('search', e.target.value || undefined)} />
        <Select options={categoryOptions} value={filters.categoryId || ''} onChange={e => setFilter('categoryId', e.target.value || undefined)} />
      </Card>

      {productsLoading ? <p>Загрузка...</p> : (
        <div className={styles.productGrid}>
          {filteredProducts.map(p => (
            <Card key={p.id} className={styles.productCard}>
              <div className={styles.productImage}>{p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : <div className={styles.placeholder}>🧶</div>}</div>
              <div className={styles.productInfo}>
                <Badge variant="info">{getCategoryById(p.categoryId)?.name || 'Без категории'}</Badge>
                <h3 className={styles.productName}>{p.name}</h3>
                <p className={styles.productDesc}>{p.description.substring(0, 80)}{p.description.length > 80 ? '...' : ''}</p>
                <div className={styles.productFooter}>
                  <span className={styles.price}>{p.price.toLocaleString('ru-RU')} ₽</span>
                  <Badge variant={p.stock > 0 ? 'success' : 'error'}>{p.stock > 0 ? `В наличии: ${p.stock}` : 'Нет в наличии'}</Badge>
                </div>
                <div className={styles.orderAction}>
                  <Button variant="primary" size="sm" fullWidth disabled={p.stock <= 0} onClick={() => openOrderModal(p)}>
                    {p.stock > 0 ? 'Заказать' : 'Нет в наличии'}
                  </Button>
                </div>
                {isSeller && (
                  <div className={styles.productActions}>
                    <Button size="sm" variant="ghost" onClick={() => openEditModal(p)}>Редактировать</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)}>Удалить</Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
          {filteredProducts.length === 0 && <p className={styles.empty}>Товары не найдены</p>}
        </div>
      )}

      {/* Product create/edit modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalMode === 'create' ? 'Новый товар' : 'Редактировать товар'}
        footer={<div className={styles.modalFooter}><Button variant="ghost" onClick={() => setModalOpen(false)}>Отмена</Button><Button variant="primary" onClick={handleSave}>Сохранить</Button></div>}>
        <div className={styles.form}>
          <Input label="Название *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Input label="Описание" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <Select label="Категория *" options={activeCategories.map(c => ({ value: c.id, label: c.name }))} value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} />
          <div className={styles.row}>
            <Input label="Цена (₽) *" type="number" min={0} value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
            <Input label="Количество" type="number" min={0} value={form.stock} onChange={e => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} />
          </div>
          <Input label="URL изображения" value={form.imageUrl || ''} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
        </div>
      </Modal>

      {/* Order modal */}
      <Modal isOpen={orderModalOpen} onClose={() => setOrderModalOpen(false)} title="Оформление заказа"
        footer={<div className={styles.modalFooter}><Button variant="ghost" onClick={() => setOrderModalOpen(false)}>Отмена</Button><Button variant="primary" onClick={handleOrder} loading={orderLoading}>Оформить заказ</Button></div>}>
        {orderProduct && (
          <div className={styles.form}>
            <div className={styles.orderProductInfo}>
              <span className={styles.orderProductName}>{orderProduct.name}</span>
              <span className={styles.orderProductPrice}>{orderProduct.price.toLocaleString('ru-RU')} ₽ / шт.</span>
            </div>
            <Input label="Количество *" type="number" min={1} max={orderProduct.stock} value={orderForm.quantity} onChange={e => setOrderForm({ ...orderForm, quantity: Math.max(1, Math.min(orderProduct.stock, parseInt(e.target.value) || 1)) })} />
            {orderForm.quantity > 0 && (
              <div className={styles.orderTotal}>
                Итого: <strong>{(orderProduct.price * orderForm.quantity).toLocaleString('ru-RU')} ₽</strong>
              </div>
            )}
            <Input label="Ваше имя *" value={orderForm.customerName} onChange={e => setOrderForm({ ...orderForm, customerName: e.target.value })} placeholder="Иванов Иван Иванович" />
            <Input label="Email *" type="email" value={orderForm.customerEmail} onChange={e => setOrderForm({ ...orderForm, customerEmail: e.target.value })} placeholder="example@mail.ru" />
            <Input label="Телефон *" type="tel" value={orderForm.customerPhone} onChange={e => setOrderForm({ ...orderForm, customerPhone: e.target.value })} placeholder="+7 (999) 123-45-67" />
            <Input label="Адрес доставки *" value={orderForm.address} onChange={e => setOrderForm({ ...orderForm, address: e.target.value })} placeholder="Город, улица, дом, квартира" />
          </div>
        )}
      </Modal>
    </div>
  );
});
